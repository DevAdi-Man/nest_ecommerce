import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { ProductCondition } from '../entities/listing.entity';
export class CreateListingDto {
  @ApiProperty({
    example: 101,
    description: 'ID of the product variant to sell',
  })
  @IsNotEmpty({ message: 'variantId is required.' })
  @IsInt({ message: 'variantId must be an integer.' })
  variantId: number;

  @ApiProperty({
    example: 'SELLER-B-IPHONE15-128',
    description: 'Seller internal SKU for this inventory item',
  })
  @IsNotEmpty({ message: 'sellerSku is required.' })
  @IsString({ message: 'sellerSku must be a string.' })
  sellerSku: string;

  @ApiProperty({
    example: 128000,
    description: 'Selling price of the variant',
  })
  @IsNotEmpty({ message: 'price is required.' })
  @IsNumber({}, { message: 'price must be a number.' })
  @IsPositive({ message: 'price must be positive.' })
  price: number;

  @ApiProperty({
    example: 134900,
    description: 'Maximum Retail Price (MRP)',
  })
  @IsNotEmpty({ message: 'mrp is required.' })
  @IsNumber({}, { message: 'mrp must be a number.' })
  @IsPositive({ message: 'mrp must be positive.' })
  mrp: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Available stock quantity for this listing',
    default: 1,
  })
  @IsOptional()
  @IsInt({ message: 'stock must be an integer.' })
  @Min(0, { message: 'stock cannot be negative.' })
  stock?: number = 1;

  @ApiPropertyOptional({
    enum: ProductCondition,
    example: ProductCondition.NEW,
    default: ProductCondition.NEW,
  })
  @IsOptional()
  @IsEnum(ProductCondition)
  condition?: ProductCondition = ProductCondition.NEW;
}
