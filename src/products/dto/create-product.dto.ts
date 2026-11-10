import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateProductVariantDto } from './create-variant.dto';
import { ProductAttributeInputDto } from './create-attribute.dto';
import { ProductListingInputDto } from './create-listing.dto';
import { CreateProductImageDto } from './create-image.dto';

export class CreateProductDto {
  @ApiProperty({
    example: 'iPhone 15 Pro',
    description: 'Product name',
  })
  @IsNotEmpty({ message: 'Product title is required.' })
  @IsString({ message: 'Product title should be string.' })
  @MinLength(2, {
    message: 'Product title must be at least 2 characters long.',
  })
  @MaxLength(100, {
    message: 'Product title cannot be longer than 100 characters.',
  })
  title: string;

  @ApiProperty({
    example: 'Titanium design with A17 Pro chip.',
    description: 'Product description',
  })
  @IsNotEmpty({ message: 'Product description is required.' })
  @IsString({ message: 'Product description should be string.' })
  @MinLength(4, {
    message: 'Product description must be at least 4 characters long.',
  })
  @MaxLength(5000, {
    message: 'Product description cannot be longer than 5000 characters.',
  })
  description: string;

  @ApiPropertyOptional({
    example: 'iphone-15-pro',
    description:
      'Unique URL-friendly identifier (slug) of the product. Auto-generated if omitted.',
  })
  @IsOptional()
  @IsString({ message: 'Product slug must be a string.' })
  @MaxLength(120, { message: 'Product slug cannot exceed 120 characters.' })
  slug?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Brand ID which product is associated with.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Brand ID must be an integer.' })
  brandId?: number;

  @ApiPropertyOptional({
    example: 'DRAFT',
    description: 'Product publish status',
  })
  @IsEnum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Category ID associated with the product',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Product category id must be an integer.' })
  categoryId?: number;

  @ApiPropertyOptional({
    type: () => CreateProductVariantDto,
    description: 'Initial variant to create or match with the product.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProductVariantDto)
  variant?: CreateProductVariantDto;

  @ApiPropertyOptional({
    type: () => [ProductAttributeInputDto],
    description: 'Specifications / attributes for the product.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeInputDto)
  attributes?: ProductAttributeInputDto[];

  @ApiPropertyOptional({
    type: () => ProductListingInputDto,
    description:
      "Seller's initial listing (offer, price, stock) for the variant.",
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductListingInputDto)
  listing?: ProductListingInputDto;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/products/iphone15-thumb.webp',
    description:
      'Convenience URL for product primary thumbnail image. Auto-creates primary image.',
  })
  @IsOptional()
  @IsString({ message: 'thumbnailUrl must be a string.' })
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    type: () => [CreateProductImageDto],
    description:
      'Product gallery images with optional thumbnail flag and sort order.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];
}
