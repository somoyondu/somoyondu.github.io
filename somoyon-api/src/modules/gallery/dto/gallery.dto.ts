import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsMongoId, IsOptional, IsString,
} from 'class-validator';
import { ContentStatus } from 'src/common/enums';

export class CreateAlbumDto {
  @ApiProperty({ example: 'Iftar Mahfil 2024' }) @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() titleBn?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() slug?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsMongoId() coverImage?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() eventDate?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() year?: number;
  @ApiPropertyOptional({ enum: ContentStatus }) @IsOptional() @IsEnum(ContentStatus) status?: ContentStatus;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() displayOrder?: number;
}

export class UpdateAlbumDto extends PartialType(CreateAlbumDto) {}

export class CreateGalleryItemDto {
  @ApiProperty() @IsMongoId() media: string;
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() titleBn?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() displayOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFeatured?: boolean;
}

export class BulkAddItemsDto {
  @ApiProperty({ type: [String], description: 'Media ids to attach to the album' })
  @IsArray() @IsMongoId({ each: true }) mediaIds: string[];

  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFeatured?: boolean;
}

export class UpdateGalleryItemDto extends PartialType(CreateGalleryItemDto) {}
