import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto';

export class SignUploadDto {
  @ApiPropertyOptional({ example: 'committee/2027/president' })
  @IsOptional() @IsString() folder?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];

  @ApiPropertyOptional()
  @IsOptional() @IsString() publicId?: string;
}

export class RegisterMediaDto {
  @ApiProperty({ description: 'public_id returned by Cloudinary' })
  @IsString() publicId: string;

  @ApiPropertyOptional() @IsOptional() @IsString() alt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() altBn?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() caption?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() captionBn?: string;
  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}

export class UpdateMediaDto extends PartialType(RegisterMediaDto) {}

export class MediaQueryDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() folder?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tag?: string;
}
