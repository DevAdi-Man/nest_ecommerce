import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
  Max,
  Min,
} from 'class-validator';

export class QueryRecommendationDto {
  @ApiPropertyOptional({
    example: 10,
    description: 'Number of recommendations to return (max 50)',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit must be an integer.' })
  @Min(1, { message: 'limit must be at least 1.' })
  @Max(50, { message: 'limit cannot exceed 50.' })
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'sess-8f12a-4bc9',
    description:
      'Guest session identifier to personalize recommendations without login',
  })
  @IsOptional()
  @IsString({ message: 'sessionId must be a string.' })
  @MaxLength(128)
  @MinLength(1)
  sessionId?: string;

  @ApiPropertyOptional({
    example: 1,
    description:
      'Product ID to explicitly exclude from recommendations (e.g. current product)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'excludeProductId must be an integer.' })
  @IsPositive({ message: 'excludeProductId must be positive.' })
  excludeProductId?: number;
}
