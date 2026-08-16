import {
  BadRequestException, Injectable, Logger, UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomBytes, createHash } from 'crypto';
import { AuditAction } from 'src/common/enums';
import { MailService } from 'src/modules/mail/mail.service';
import { AuditService } from '../audit/audit.service';
import { UsersService } from '../users/users.service';
import { GoogleAuthService } from './google.service';
import { LoginDto, ResetPasswordDto } from './dto/auth.dto';

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 30;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
    private readonly mail: MailService,
    private readonly google: GoogleAuthService,
  ) {}

  private sha256(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }

  private async signTokens(payload: { sub: string; email: string; role: string; name?: string }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get('jwt.accessSecret'),
        expiresIn: this.config.get('jwt.accessTtl'),
      }),
      this.jwt.signAsync(
        { sub: payload.sub, tv: randomBytes(8).toString('hex') },
        {
          secret: this.config.get('jwt.refreshSecret'),
          expiresIn: this.config.get('jwt.refreshTtl'),
        },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  async login(dto: LoginDto, ip?: string) {
    const user = await this.users.findByEmailWithSecrets(dto.email);
    // Constant-ish response regardless of whether the email exists.
    if (!user) throw new UnauthorizedException('Invalid email or password');

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException(
        `Account locked. Try again after ${user.lockedUntil.toLocaleTimeString()}`,
      );
    }
    if (!user.isActive) throw new UnauthorizedException('Account is deactivated');

    const valid = await this.users.verify(user.passwordHash, dto.password);
    if (!valid) {
      user.failedLoginAttempts = (user.failedLoginAttempts ?? 0) + 1;
      if (user.failedLoginAttempts >= MAX_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60_000);
        user.failedLoginAttempts = 0;
      }
      await user.save();
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: String(user._id), email: user.email, role: user.role, name: user.name };
    const tokens = await this.signTokens(payload);

    user.refreshTokenHash = await argon2.hash(tokens.refreshToken, { type: argon2.argon2id });
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    await this.audit.record({
      actor: String(user._id), actorEmail: user.email, action: AuditAction.LOGIN,
      entity: 'Auth', ip, summary: `${user.email} logged in`,
    });

    return {
      tokens,
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        nameBn: user.nameBn,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }

  /**
   * Google sign-in. The Google account only proves *who* the person is —
   * authorisation still comes from our own users collection, so an arbitrary
   * Gmail address cannot get in.
   */
  async loginWithGoogle(idToken: string, ip?: string) {
    const payload = await this.google.verifyIdToken(idToken);
    const email = payload.email!.toLowerCase();

    const user = await this.users.findByEmailWithSecrets(email);
    if (!user) {
      await this.audit.record({
        actorEmail: email,
        action: AuditAction.LOGIN,
        entity: 'Auth',
        ip,
        summary: `Rejected Google sign-in for non-admin ${email}`,
      });
      throw new UnauthorizedException(
        'এই ইমেইলটি অ্যাডমিন হিসেবে নিবন্ধিত নয়। সুপার অ্যাডমিনের সাথে যোগাযোগ করুন।',
      );
    }
    if (!user.isActive) throw new UnauthorizedException('অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে');

    const tokens = await this.signTokens({
      sub: String(user._id), email: user.email, role: user.role, name: user.name,
    });

    user.refreshTokenHash = await argon2.hash(tokens.refreshToken, { type: argon2.argon2id });
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLoginAt = new Date();
    // A Google-verified identity replaces the password prompt entirely.
    user.mustChangePassword = false;
    await user.save();

    await this.audit.record({
      actor: String(user._id), actorEmail: user.email, action: AuditAction.LOGIN,
      entity: 'Auth', ip, summary: `${user.email} logged in with Google`,
    });

    return {
      tokens,
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        nameBn: user.nameBn,
        role: user.role,
        mustChangePassword: false,
        picture: payload.picture,
      },
    };
  }

  async refresh(refreshToken?: string) {
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');

    let decoded: any;
    try {
      decoded = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.users.findByIdWithSecrets(decoded.sub);
    if (!user || !user.isActive || !user.refreshTokenHash) {
      throw new UnauthorizedException('Session expired, please log in again');
    }

    const matches = await argon2.verify(user.refreshTokenHash, refreshToken).catch(() => false);
    if (!matches) {
      // Token reuse: revoke the whole family.
      user.refreshTokenHash = undefined;
      await user.save();
      this.logger.warn(`Refresh token reuse detected for ${user.email}`);
      throw new UnauthorizedException('Session expired, please log in again');
    }

    const tokens = await this.signTokens({
      sub: String(user._id), email: user.email, role: user.role, name: user.name,
    });
    user.refreshTokenHash = await argon2.hash(tokens.refreshToken, { type: argon2.argon2id });
    await user.save();

    return {
      tokens,
      user: {
        id: String(user._id), email: user.email, name: user.name,
        role: user.role, mustChangePassword: user.mustChangePassword,
      },
    };
  }

  async logout(userId: string, email?: string) {
    const user = await this.users.findByIdWithSecrets(userId);
    if (user) {
      user.refreshTokenHash = undefined;
      await user.save();
    }
    await this.audit.record({
      actor: userId, actorEmail: email, action: AuditAction.LOGOUT, entity: 'Auth',
    });
    return { success: true as const };
  }

  /** Always returns success so the endpoint cannot be used to enumerate accounts. */
  async forgotPassword(email: string) {
    const user = await this.users.findByEmailWithSecrets(email);
    if (user && user.isActive) {
      const token = randomBytes(32).toString('hex');
      (user as any).passwordResetTokenHash = this.sha256(token);
      (user as any).passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      await this.mail.sendPasswordReset(user.email, user.name, token);
    }
    return { success: true as const, message: 'If that account exists, a reset link has been sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const hash = this.sha256(dto.token);
    const user = await this.users.findByResetTokenHash(hash);

    if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
      throw new BadRequestException('Reset link is invalid or has expired');
    }

    user.passwordHash = await this.users.hash(dto.newPassword);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    user.refreshTokenHash = undefined;
    user.mustChangePassword = false;
    await user.save();

    return { success: true as const };
  }
}
