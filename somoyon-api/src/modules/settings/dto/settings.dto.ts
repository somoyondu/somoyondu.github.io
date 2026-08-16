import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsMongoId, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() siteName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tagline?: string;
  @ApiPropertyOptional() @IsOptional() @IsMongoId() logo?: string;
  @ApiPropertyOptional() @IsOptional() @IsMongoId() whiteLogo?: string;
  @ApiPropertyOptional() @IsOptional() @IsMongoId() favicon?: string;
  @ApiPropertyOptional() @IsOptional() @IsMongoId() heroBackground?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() hero?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsObject() about?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsObject() foundingBlurb?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsObject() advisoryBlurb?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsObject() galleryBlurb?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsObject() contact?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsArray() socials?: Record<string, any>[];
  @ApiPropertyOptional() @IsOptional() @IsObject() donation?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsArray() navLinks?: Record<string, any>[];
  @ApiPropertyOptional() @IsOptional() @IsObject() seo?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() maintenanceMode?: boolean;
}
