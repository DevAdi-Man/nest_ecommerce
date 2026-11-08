import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class RecordViewDto {
  @ApiProperty({
    example: 1,
    description: 'Product ID being viewed',
  })
  @IsNotEmpty({ message: 'productId is required.' })
  @Type(() => Number)
  @IsInt({ message: 'productId must be an integer.' })
  @IsPositive({ message: 'productId must be positive.' })
  productId: number;

  @ApiPropertyOptional({
    example: 'sess-8f12a-4bc9',
    description:
      'Client browser or mobile session identifier for guest shoppers',
  })
  @IsOptional()
  @IsString({ message: 'sessionId must be a string.' })
  sessionId?: string;

  @ApiPropertyOptional({
    example: 30,
    description: 'Dwell time in seconds spent viewing the product',
    default: 15,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'durationSeconds must be an integer.' })
  @Min(1, { message: 'durationSeconds must be at least 1 second.' })
  @Max(3600, { message: 'durationSeconds cannot exceed 3600 seconds.' })
  durationSeconds?: number = 15;
}
