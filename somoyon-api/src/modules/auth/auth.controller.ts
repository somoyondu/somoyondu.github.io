import {
  Body, Controller, Get, HttpCode, Ip, Patch, Post, Req, Res, UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { CurrentUser, JwtUser, Public } from 'src/common/decorators';
import { ChangePasswordDto } from '../users/dto/user.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, GoogleLoginDto, LoginDto, ResetPasswordDto } from './dto/auth.dto';
import { GoogleAuthService } from './google.service';

const REFRESH_COOKIE = 'somoyon_rt';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
    private readonly config: ConfigService,
    private readonly google: GoogleAuthService,
  ) {}

  private setRefreshCookie(res: Response, token: string) {
    const isProd = this.config.get('env') === 'production';
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 900_000 } })
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response, @Ip() ip: string) {
    const { tokens, user } = await this.auth.login(dto, ip);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, user };
  }

  @Public()
  @Get('google/config')
  googleConfig() {
    return { enabled: this.google.isEnabled, clientId: this.google.clientId ?? null };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 900_000 } })
  @Post('google')
  @HttpCode(200)
  async googleLogin(
    @Body() dto: GoogleLoginDto,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
  ) {
    const { tokens, user } = await this.auth.loginWithGoogle(dto.idToken, ip);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, user };
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE] || (req.body as any)?.refreshToken;
    const { tokens, user } = await this.auth.refresh(token);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, user };
  }

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(200)
  async logout(@CurrentUser() user: JwtUser, @Res({ passthrough: true }) res: Response) {
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
    return this.auth.logout(user.sub, user.email);
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: JwtUser) {
    return this.users.findById(user.sub);
  }

  @ApiBearerAuth()
  @Patch('change-password')
  changePassword(@CurrentUser() user: JwtUser, @Body() dto: ChangePasswordDto) {
    return this.users.changePassword(user.sub, dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 900_000 } })
  @Post('forgot-password')
  @HttpCode(200)
  forgot(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.email);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 900_000 } })
  @Post('reset-password')
  @HttpCode(200)
  reset(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }
}
