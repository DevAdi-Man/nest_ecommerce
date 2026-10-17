import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
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
    example: '27ABCDE1234F1Z5',
    description: 'GSTIN of the seller',
  })
  @IsString({ message: 'GSTIN must be a string.' })
  @IsNotEmpty({ message: 'GSTIN is required.' })
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, {
    message: 'GSTIN must be a valid GSTIN format.',
  })
  declare gstin: string;

  @ApiProperty({
    enum: SellerTier,
    example: SellerTier.GOLD,
    description: 'Tier of the seller',
  })
  @IsNotEmpty({ message: 'Tier is required.' })
  @IsEnum(SellerTier, {
    message: 'Tier must be one of the following values: BRONZE, SILVER, GOLD.',
  })
  declare tier: SellerTier;
}
