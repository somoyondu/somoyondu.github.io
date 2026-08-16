import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PaginationDto } from 'src/common/dto';
import { SubmissionStatus } from 'src/common/enums';

export class CreateContactDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(120) name: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) phone?: string;
  @ApiProperty() @IsString() @MinLength(3) @MaxLength(200) subject: string;
  @ApiProperty() @IsString() @MinLength(10) @MaxLength(4000) message: string;

  /** Honeypot — real users never fill this. */
  @ApiPropertyOptional() @IsOptional() @IsString() website?: string;
}

export class UpdateContactDto {
  @ApiPropertyOptional({ enum: SubmissionStatus })
  @IsOptional() @IsEnum(SubmissionStatus) status?: SubmissionStatus;

  @ApiPropertyOptional() @IsOptional() @IsString() adminNote?: string;
}

export class ContactQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: SubmissionStatus })
  @IsOptional() @IsEnum(SubmissionStatus) status?: SubmissionStatus;
}
