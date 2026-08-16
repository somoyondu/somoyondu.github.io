import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsMongoId, IsOptional, IsString, ValidateNested,
} from 'class-validator';

export class PersonSocialsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() facebook?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() linkedin?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
}

export class CreatePersonDto {
  @ApiProperty({ example: 'মো. নাজমুল' }) @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nameEn?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() slug?: string;
  @ApiPropertyOptional() @IsOptional() @IsMongoId() photo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() department?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() session?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bio?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bioBn?: string;
  @ApiPropertyOptional({ type: PersonSocialsDto })
  @IsOptional() @ValidateNested() @Type(() => PersonSocialsDto) socials?: PersonSocialsDto;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPublic?: boolean;
}

export class UpdatePersonDto extends PartialType(CreatePersonDto) {}

export class MergePeopleDto {
  @ApiProperty({ description: 'Person kept after the merge' })
  @IsMongoId() keepId: string;

  @ApiProperty({ type: [String], description: 'People merged into keepId and deleted' })
  @IsArray() @IsMongoId({ each: true }) mergeIds: string[];
}
