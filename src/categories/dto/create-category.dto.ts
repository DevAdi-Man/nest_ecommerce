import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Men\'s Clothing',
    description: 'Category name',
  })
  @IsNotEmpty({ message: 'Category name is required.' })
  @IsString({ message: 'Category name should be string.' })
  @MinLength(2, { message: 'Category name must be at least 2 characters long.' })
  @MaxLength(50, { message: 'Categroy name cannot be longer than 50 characters.' })
  name: string;

  @ApiPropertyOptional({
    example: 'https://example.com/images/mens-clothing.jpg',
    description: 'Category image URL',
  })
  @IsOptional()
  @IsString({ message: 'Category image should be string.' })
  image?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Parent category ID for sub-categories',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Category parent id must integer.' })
  parentId?: number;
}
