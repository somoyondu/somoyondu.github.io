import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean, IsEnum, IsInt, IsMongoId, IsOptional, IsString, Max, Min,
} from 'class-validator';
import { ContentStatus, PositionGroup } from 'src/common/enums';

export class CreateCommitteeDto {
  @ApiProperty({ example: 2027 })
  @Type(() => Number) @IsInt() @Min(2000) @Max(2100) year: number;

  @ApiProperty({ example: 'কার্যনির্বাহী পরিষদ ২০২৭' }) @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() expandButtonText?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() collapseButtonText?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFounding?: boolean;
  @ApiPropertyOptional({ enum: ContentStatus }) @IsOptional() @IsEnum(ContentStatus) status?: ContentStatus;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() displayOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsMongoId() coverImage?: string;
}

export class UpdateCommitteeDto extends PartialType(CreateCommitteeDto) {}

export class CloneCommitteeDto {
  @ApiProperty({ description: 'Year to copy the structure from', example: 2026 })
  @Type(() => Number) @IsInt() sourceYear: number;

  @ApiProperty({ description: 'New year to create', example: 2027 })
  @Type(() => Number) @IsInt() targetYear: number;

  @ApiPropertyOptional({ description: 'Copy people too, or only the designation slots', default: true })
  @IsOptional() @IsBoolean() copyPeople?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
}

export class CreatePositionDto {
  @ApiProperty() @IsMongoId() person: string;
  @ApiProperty() @IsMongoId() designation: string;
  @ApiPropertyOptional({ enum: PositionGroup, description: 'Defaults to the designation group' })
  @IsOptional() @IsEnum(PositionGroup) group?: PositionGroup;
  @ApiPropertyOptional() @IsOptional() @IsMongoId() photoOverride?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() displayOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdatePositionDto extends PartialType(CreatePositionDto) {}
