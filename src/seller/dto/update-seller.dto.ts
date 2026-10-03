import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SellerTier } from './create-seller.dto';

export class UpdateSellerDto {
  // --- Profile Fields ---
  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Profile picture URL',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Avatar must be a valid URL.' })
  avatar?: string;

  @ApiPropertyOptional({ example: 'Aditya' })
  @IsOptional()
  @IsString({ message: 'First name must be a string.' })
  @MinLength(3, { message: 'First name must be at least 3 characters long.' })
  @MaxLength(50, { message: 'First name cannot be longer than 50 characters.' })
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'First name can only contain letters and spaces.',
  })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Singh' })
  @IsOptional()
  @IsString({ message: 'Middle name must be a string.' })
  @MaxLength(50, {
    message: 'Middle name cannot be longer than 50 characters.',
  })
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'Middle name can only contain letters and spaces.',
  })
  middleName?: string;

  @ApiPropertyOptional({ example: 'Deva' })
  @IsOptional()
  @IsString({ message: 'Last name must be a string.' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long.' })
  @MaxLength(50, { message: 'Last name cannot be longer than 50 characters.' })
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'Last name can only contain letters and spaces.',
  })
  lastName?: string;

  @ApiPropertyOptional({ example: '2002-05-11' })
  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid ISO date.' })
  dateOfBirth?: string;

  // --- Business Fields ---
  @ApiPropertyOptional({
    example: 'ABC Pvt Ltd',
    description: 'Legal business name of the seller',
  })
  @IsOptional()
  @IsString({ message: 'Legal business name must be a string.' })
  @MinLength(3, {
    message: 'Legal business name must be at least 3 characters long.',
  })
  @MaxLength(100, {
    message: 'Legal business name cannot be longer than 100 characters.',
  })
  legalBusinessName?: string;

  @ApiPropertyOptional({
    example: '27ABCDE1234F1Z5',
    description: 'GSTIN of the seller',
  })
  @IsOptional()
  @IsString({ message: 'GSTIN must be a string.' })
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, {
    message: 'GSTIN must be a valid GSTIN format.',
  })
  gstin?: string;

  @ApiPropertyOptional({
    enum: SellerTier,
    example: SellerTier.GOLD,
    description: 'Tier of the seller',
  })
  @IsOptional()
  @IsEnum(SellerTier, {
    message: 'Tier must be one of the following values: BRONZE, SILVER, GOLD.',
  })
  tier?: SellerTier;
}
