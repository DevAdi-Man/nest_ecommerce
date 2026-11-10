import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ListingStatus } from '../entities/listing.entity';

export class QueryListingDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Page number for pagination',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer.' })
  @Min(1, { message: 'Page must be at least 1.' })
  page?: number = 1;

  @ApiPropertyOptional({
    example: 20,
    default: 20,
    description: 'Number of items per page (max 100)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer.' })
  @Min(1, { message: 'Limit must be at least 1.' })
  @Max(100, { message: 'Limit cannot exceed 100.' })
  limit?: number = 20;

  @ApiPropertyOptional({
    enum: ListingStatus,
    description:
      'Filter listings by status (ACTIVE, INACTIVE, OUT_OF_STOCK, DRAFT)',
  })
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;
}
