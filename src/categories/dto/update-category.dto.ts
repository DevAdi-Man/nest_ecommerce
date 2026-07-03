import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsNotEmpty({ message: 'Category name is required.' })
  @IsString({ message: 'Category name should be string.' })
  @MinLength(2, {
    message: 'Category name must be at least 2 characters long.',
  })
  @MaxLength(50, {
    message: 'Categroy name cannot be longer than 50 characters.',
  })
  name: string;

  @IsString({ message: 'Category image should be string.' })
  image?: string;

  @IsInt({ message: 'Category parent id must integer.' })
  parentId?: number;
}
