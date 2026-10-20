import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CategoryQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number',
    default: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of categories per page',
    default: 10,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;

  @ApiPropertyOptional({
    description: 'Search by category name or slug',
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    enum: ['createdAt', 'updatedAt', 'name'],
    default: 'createdAt',
    type: String,
  })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'name'])
  sortBy = 'createdAt';

  @ApiPropertyOptional({
    enum: ['ASC', 'DESC'],
    default: 'DESC',
    type: String,
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    description: 'Filter by parent category',
    example: 1,
    type: Number,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  parentId?: number;
}
