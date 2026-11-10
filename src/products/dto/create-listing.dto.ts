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

export class ProductListingInputDto {
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

  @ApiPropertyOptional({
    example: 'MERCHANT',
    description: 'Fulfillment type (e.g. MERCHANT or PLATFORM)',
    default: 'MERCHANT',
  })
  @IsOptional()
  @IsString({ message: 'fulfillmentType must be a string.' })
  fulfillmentType?: string = 'MERCHANT';
}

export class CreateListingDto extends ProductListingInputDto {
  @ApiPropertyOptional({
    example: 101,
    description:
      'ID of the product variant to sell. Required if not provided in URL.',
  })
  @IsOptional()
  @IsInt({ message: 'variantId must be an integer.' })
  variantId?: number;
}
