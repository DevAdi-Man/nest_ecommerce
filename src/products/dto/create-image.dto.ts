import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductImageDto {
  @ApiProperty({
    example: 'https://cdn.example.com/products/iphone15-front.webp',
    description: 'Public URL of the product image',
  })
  @IsNotEmpty({ message: 'imageUrl is required.' })
  @IsString({ message: 'imageUrl must be a string.' })
  imageUrl: string;

  @ApiPropertyOptional({
    example: true,
    default: false,
    description:
      'Whether this image is the primary/thumbnail image of the product',
  })
  @IsOptional()
  @IsBoolean({ message: 'isPrimary must be a boolean.' })
  isPrimary?: boolean = false;

  @ApiPropertyOptional({
    example: 0,
    default: 0,
    description: 'Sort order / display sequence of the image in the gallery',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'sortOrder must be an integer.' })
  @Min(0, { message: 'sortOrder cannot be negative.' })
  sortOrder?: number = 0;

  @ApiPropertyOptional({
    example: 101,
    description:
      'Variant ID if this image is specific to a variant (e.g. Black color phone)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'varientId must be an integer.' })
  varientId?: number;
}
