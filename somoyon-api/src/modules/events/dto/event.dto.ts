import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray, IsBoolean, IsDateString, IsEnum, IsMongoId, IsOptional, IsString,
} from 'class-validator';
import { ContentStatus } from 'src/common/enums';
import { PaginationDto } from 'src/common/dto';

export class CreateEventDto {
  @ApiProperty() @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() titleBn?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() slug?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() excerpt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() content?: string;
  @ApiPropertyOptional() @IsOptional() @IsMongoId() coverImage?: string;
  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsMongoId({ each: true }) gallery?: string[];
  @ApiProperty() @IsDateString() startAt: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() venue?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() venueBn?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() registrationUrl?: string;
  @ApiPropertyOptional({ enum: ContentStatus }) @IsOptional() @IsEnum(ContentStatus) status?: ContentStatus;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFeatured?: boolean;
  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}

export class UpdateEventDto extends PartialType(CreateEventDto) {}

export class EventQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['upcoming', 'past', 'all'] })
  @IsOptional() @IsString() when?: 'upcoming' | 'past' | 'all';

  @ApiPropertyOptional({ enum: ContentStatus })
  @IsOptional() @IsEnum(ContentStatus) status?: ContentStatus;
}
