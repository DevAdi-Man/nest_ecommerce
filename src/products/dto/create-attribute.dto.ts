import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ProductAttributeInputDto {
  @ApiProperty({
    example: 'Processor',
    description: 'Name of the product specification / attribute.',
  })
  @IsNotEmpty({ message: 'attrName is required.' })
  @IsString({ message: 'attrName must be a string.' })
  @MaxLength(100, { message: 'attrName cannot exceed 100 characters.' })
  attrName: string;

  @ApiProperty({
    example: 'A17 Pro',
    description: 'Value of the product specification / attribute.',
  })
  @IsNotEmpty({ message: 'attrValue is required.' })
  @IsString({ message: 'attrValue must be a string.' })
  @MaxLength(200, { message: 'attrValue cannot exceed 200 characters.' })
  attrValue: string;
}
