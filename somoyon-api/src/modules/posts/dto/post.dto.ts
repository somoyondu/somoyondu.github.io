import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsMongoId, IsObject, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto';
import { ContentStatus, PostCategory } from 'src/common/enums';

export class CreatePostDto {
  @ApiProperty() @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() titleBn?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() slug?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() excerpt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() content?: string;
  @ApiPropertyOptional() @IsOptional() @IsMongoId() coverImage?: string;
  @ApiPropertyOptional({ enum: PostCategory }) @IsOptional() @IsEnum(PostCategory) category?: PostCategory;
  @ApiPropertyOptional({ enum: ContentStatus }) @IsOptional() @IsEnum(ContentStatus) status?: ContentStatus;
  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPinned?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsObject() seo?: Record<string, any>;
}

export class UpdatePostDto extends PartialType(CreatePostDto) {}

export class PostQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: PostCategory }) @IsOptional() @IsEnum(PostCategory) category?: PostCategory;
  @ApiPropertyOptional({ enum: ContentStatus }) @IsOptional() @IsEnum(ContentStatus) status?: ContentStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() tag?: string;
}
