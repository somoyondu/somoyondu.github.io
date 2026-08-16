import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsMongoId, Min, ValidateNested } from 'class-validator';

export class ReorderItemDto {
  @ApiProperty()
  @IsMongoId()
  id: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  displayOrder: number;
}

export class ReorderDto {
  @ApiProperty({ type: [ReorderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
