import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min, IsEnum } from 'class-validator';
import { SellerStatus } from '../entities/seller.entity';

export class SellerQueryDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  declare page?: number;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  declare limit?: number;

  @ApiPropertyOptional({
    enum: SellerStatus,
    example: SellerStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(SellerStatus)
  declare status?: SellerStatus;
}
