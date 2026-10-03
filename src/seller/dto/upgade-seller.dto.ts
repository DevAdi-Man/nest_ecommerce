import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SellerTier } from './create-seller.dto';

export class UpgradeSellerDto {
  @ApiProperty({
    example: 'ABC Pvt Ltd',
    description: 'Legal business name of the seller',
  })
  @IsString({ message: 'Legal business name must be a string.' })
  @IsNotEmpty({ message: 'Legal business name is required.' })
  @MinLength(3, {
    message: 'Legal business name must be at least 3 characters long.',
  })
  @MaxLength(100, {
    message: 'Legal business name cannot be longer than 100 characters.',
  })
  declare legalBusinessName: string;

  @ApiProperty({
    example: '123456789012345',
    description: 'GSTIN of the seller',
  })
  @IsString({ message: 'GSTIN must be a string.' })
  @IsNotEmpty({ message: 'GSTIN is required.' })
  declare gstin: string;

  @ApiProperty({
    example: 'Gold',
    description: 'Tier of the seller',
  })
  @IsString({ message: 'Tier must be a string.' })
  @IsNotEmpty({ message: 'Tier is required.' })
  @IsEnum(SellerTier, {
    message: 'Tier must be one of the following values: BRONZE, SILVER, GOLD.',
  })
  declare tier: SellerTier;
}
