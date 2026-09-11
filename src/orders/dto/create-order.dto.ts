import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Address Id is required.',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  addressId: number;

  @ApiPropertyOptional({
    description: 'Add Coupen to get a discound.',
    example: 'ABK334',
  })
  @IsString()
  @IsOptional()
  coupen: string;
}
