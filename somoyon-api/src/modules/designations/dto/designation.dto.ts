import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PositionGroup } from 'src/common/enums';

export class CreateDesignationDto {
  @ApiPropertyOptional({ description: 'Auto-generated from nameEn/nameBn when omitted' })
  @IsOptional() @IsString() slug?: string;

  @ApiProperty({ example: 'সহ-সভাপতি' }) @IsString() nameBn: string;
  @ApiPropertyOptional({ example: 'Vice President' }) @IsOptional() @IsString() nameEn?: string;
  @ApiProperty({ enum: PositionGroup }) @IsEnum(PositionGroup) group: PositionGroup;
  @ApiPropertyOptional({ default: 100 }) @IsOptional() @Type(() => Number) @IsInt() rank?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateDesignationDto extends PartialType(CreateDesignationDto) {}
