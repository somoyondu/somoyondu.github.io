import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength,
} from 'class-validator';
import { Role } from 'src/common/enums';

export class CreateUserDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty({ minLength: 12 }) @IsString() @MinLength(12) password: string;
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nameBn?: string;
  @ApiProperty({ enum: Role }) @IsEnum(Role) role: Role;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class ChangePasswordDto {
  @ApiProperty() @IsString() currentPassword: string;
  @ApiProperty({ minLength: 12 }) @IsString() @MinLength(12) newPassword: string;
}
