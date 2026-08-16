import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@somoyon.org' }) @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(8) password: string;
}

export class ForgotPasswordDto {
  @ApiProperty() @IsEmail() email: string;
}

export class ResetPasswordDto {
  @ApiProperty() @IsString() token: string;
  @ApiProperty({ minLength: 12 }) @IsString() @MinLength(12) newPassword: string;
}

export class GoogleLoginDto {
  @ApiProperty({ description: 'ID token from Google Identity Services' })
  @IsString()
  idToken: string;
}
