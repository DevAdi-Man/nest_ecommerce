import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({
    example: 'Nike',
    description: 'Name of the brand.',
  })
  @IsString({ message: 'Brand name must be a string.' })
  @IsNotEmpty({ message: 'Brand name is required.' })
  @MinLength(2, { message: 'Brand name must be at least 2 characters.' })
  @MaxLength(100, { message: 'Brand name cannot exceed 100 characters.' })
  name: string;

  @ApiPropertyOptional({
    example: 'nike',
    description:
      'Unique URL-friendly identifier (slug) of the brand. Auto-generated if omitted.',
  })
  @IsOptional()
  @IsString({ message: 'Brand slug must be a string.' })
  @MaxLength(120, { message: 'Brand slug cannot exceed 120 characters.' })
  slug?: string;

  @ApiProperty({
    example: 'https://ecommerce.com/brands/nike/logo.png',
    description: 'Public URL of the brand logo.',
  })
  @IsString({ message: 'Brand logo URL must be a string.' })
  @IsUrl({}, { message: 'Brand logo must be a valid URL.' })
  @IsNotEmpty({ message: 'Brand logo URL is required.' })
  logoUrl: string;
}
