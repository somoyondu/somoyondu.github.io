import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateAdvisorDto {
  @ApiProperty({ example: 'অধ্যাপক ড. মোঃ আখতারুজ্জামান' }) @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nameEn?: string;
  @ApiProperty({ example: 'সাবেক উপাচার্য, ঢাকা বিশ্ববিদ্যালয়' }) @IsString() designation: string;
  @ApiPropertyOptional() @IsOptional() @IsString() designationEn?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() organization?: string;
  @ApiPropertyOptional() @IsOptional() @IsMongoId() photo?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() displayOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() year?: number;
}

export class UpdateAdvisorDto extends PartialType(CreateAdvisorDto) {}
