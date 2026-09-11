import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
  ArrayMinSize,
} from 'class-validator';

export class CreateProductDto {
  // name cheye
  @ApiProperty({
    example: 'Puma Pants',
    description: 'Product name',
  })
  @IsNotEmpty({ message: 'Product name is required.' })
  @IsString({ message: 'Product name should be string.' })
  @MinLength(2, {
    message: 'Product name must be at least 2 characters long.',
  })
  @MaxLength(50, {
    message: 'Procuct name cannot be longer than 50 characters.',
  })
  name: string;

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

  // price chiye
  @ApiProperty({
    example: 22.22,
    description: 'Product price',
  })
  @IsNotEmpty({ message: 'Product price is required.' })
  @IsNumber({}, { message: 'Product price should be number.' })
  @IsPositive({ message: "Price can't be negative." })
  price: number;
  // image chiye min 2 chiye

  @ApiProperty({
    example: ['img.jpg', 'img.png'],
    description: 'Product Images',
  })
  @IsNotEmpty({ message: 'Product images is required.' })
  @ArrayMinSize(2, { message: 'At least 2 images are required.' })
  @IsArray({ message: 'Product images should be an Array.' })
  @IsString({ each: true, message: 'Each image product should be an string.' })
  images: string[];

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
