import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  // name cheye
  @ApiProperty({
    example: 'Puma Pants',
    description: 'Product name',
  })
  @IsNotEmpty({ message: 'Product title is required.' })
  @IsString({ message: 'Product title should be string.' })
  @MinLength(2, {
    message: 'Product title must be at least 2 characters long.',
  })
  @MaxLength(50, {
    message: 'Procuct title cannot be longer than 50 characters.',
  })
  title: string;

  // decription chiye
  @ApiProperty({
    example: 'This is a unique pants.',
    description: 'Product description',
  })
  @IsNotEmpty({ message: 'Product description is required.' })
  @IsString({ message: 'Product description should be string.' })
  @MinLength(4, {
    message: 'Prodcut description must at least 4 characters longs.',
  })
  @MaxLength(5000, {
    message: 'Product description cannot be longer than 5000 characters.',
  })
  description: string;

  @ApiProperty({
    example: 1,
    description: 'Brand Id which product is associated with.',
  })
  @IsOptional()
  @IsInt()
  brandId?: number;

  @ApiProperty({
    example: 'DRAFT',
    description: 'Is product still have to upload',
  })
  @IsEnum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  @IsOptional()
  status?: string;

  // categoryId chiye beacuse pta to chle kis category se match kr ta hai (Question ek product multiple ccategory se bhe ho skta hai kya)
  @ApiProperty({
    example: 1,
    description: 'Category ID associated with the product',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Product category id must integer.' })
  categoryId?: number;
}
