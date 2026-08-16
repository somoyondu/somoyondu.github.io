import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, type TokenPayload } from 'google-auth-library';

/**
 * Verifies Google ID tokens issued to the admin panel.
 *
 * Authorisation is deliberately *not* "any Google account". A token only
 * passes if the email already exists as an active user in our database (and,
 * optionally, appears in GOOGLE_ALLOWED_EMAILS / matches the hosted domain).
 * Signing in with Google never creates an account.
 */
@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name);
  private client?: OAuth2Client;

  constructor(private readonly config: ConfigService) {
    const clientId = this.config.get<string>('google.clientId');
    if (clientId) {
      this.client = new OAuth2Client(clientId);
    } else {
      this.logger.warn('GOOGLE_CLIENT_ID not set — Google sign-in is disabled');
    }
  }

  get isEnabled() {
    return !!this.client;
  }

  get clientId() {
    return this.config.get<string>('google.clientId');
  }

  async verifyIdToken(idToken: string): Promise<TokenPayload> {
    if (!this.client) {
      throw new UnauthorizedException('Google sign-in is not configured on this server');
    }

    let payload: TokenPayload | undefined;
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.clientId,
      });
      payload = ticket.getPayload();
    } catch (err) {
      this.logger.warn(`Google token verification failed: ${(err as Error).message}`);
      throw new UnauthorizedException('Google সাইন-ইন যাচাই করা যায়নি');
    }

    if (!payload?.email) throw new UnauthorizedException('Google account has no email');
    if (!payload.email_verified) throw new UnauthorizedException('Google email is not verified');

    const issuers = ['accounts.google.com', 'https://accounts.google.com'];
    if (!issuers.includes(payload.iss)) throw new UnauthorizedException('Invalid token issuer');

    const hostedDomain = this.config.get<string>('google.hostedDomain');
    if (hostedDomain && payload.hd !== hostedDomain) {
      throw new UnauthorizedException(`Only ${hostedDomain} accounts are allowed`);
    }

    const allowlist = this.config.get<string[]>('google.allowedEmails') ?? [];
    if (allowlist.length && !allowlist.includes(payload.email.toLowerCase())) {
      throw new UnauthorizedException('এই ইমেইলটি অ্যাডমিন হিসেবে অনুমোদিত নয়');
    }

    return payload;
  }
}
