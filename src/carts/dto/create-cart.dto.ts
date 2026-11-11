import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
  IsPositive,
} from 'class-validator';

export class CreateCartDto {
  @ApiProperty({
    description: 'Id of the seller listing to add to cart.',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  listingId: number;

  @ApiPropertyOptional({
    description: 'Quentity of the product.',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number = 1;
}
