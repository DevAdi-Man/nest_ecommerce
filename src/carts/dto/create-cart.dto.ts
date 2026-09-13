import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreateCartDto {
  @ApiProperty({
    description: 'Product variant ID to add in cart',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  productVariantId: number;

  @ApiPropertyOptional({
    description: 'Quantity of Product',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}
