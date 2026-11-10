import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProductVariantDto {
  @ApiProperty({
    example: 'IPHONE15-BLK-128',
    description: 'Universal SKU / barcode / EAN for this variant.',
  })
  @IsNotEmpty({ message: 'universalSku is required.' })
  @IsString({ message: 'universalSku must be a string.' })
  @MaxLength(100, { message: 'universalSku cannot exceed 100 characters.' })
  universalSku: string;

  @ApiPropertyOptional({
    example: 'XL',
    description: 'Size of the variant (if applicable, e.g. apparel/shoes).',
  })
  @IsOptional()
  @IsString({ message: 'size must be a string.' })
  @MaxLength(50, { message: 'size cannot exceed 50 characters.' })
  size?: string;

  @ApiPropertyOptional({
    example: 'Space Black',
    description: 'Color of the variant (if applicable).',
  })
  @IsOptional()
  @IsString({ message: 'color must be a string.' })
  @MaxLength(50, { message: 'color cannot exceed 50 characters.' })
  color?: string;

  @ApiPropertyOptional({
    example: 0.22,
    description:
      'Weight of the variant in kilograms (for shipping calculation).',
  })
  @IsOptional()
  @IsNumber({}, { message: 'weight must be a number.' })
  @IsPositive({ message: 'weight must be positive.' })
  weight?: number;

  @ApiPropertyOptional({
    example: { storage: '128GB', ram: '8GB' },
    description:
      'Dynamic key-value attributes for this variant (e.g. storage, ram, edition, volume).',
  })
  @IsOptional()
  @IsObject({ message: 'attributes must be a valid key-value object.' })
  attributes?: Record<string, any>;
}
