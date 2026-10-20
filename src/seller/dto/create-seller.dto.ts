import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsEmail,
  IsUrl,
} from 'class-validator';

export enum SellerTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
}
export class CreateSellerDto {
  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Profile picture URL',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Avatar must be a valid URL.' })
  avatar?: string;

  @ApiProperty({ example: 'Prachi' })
  @IsString({ message: 'First name must be a string.' })
  @IsNotEmpty({ message: 'First name is required.' })
  @MinLength(3, { message: 'First name must be at least 3 characters long.' })
  @MaxLength(50, { message: 'First name cannot be longer than 50 characters.' })
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'First name can only contain letters and spaces.',
  })
  declare firstName: string;

  @ApiPropertyOptional({ example: 'Singh' })
  @IsOptional()
  @IsString({ message: 'Middle name must be a string.' })
  @MaxLength(50, {
    message: 'Middle name cannot be longer than 50 characters.',
  })
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'Middle name can only contain letters and spaces.',
  })
  declare middleName?: string;

  @ApiProperty({ example: 'Sharma' })
  @IsString({ message: 'Last name must be a string.' })
  @IsNotEmpty({ message: 'Last name is required.' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long.' })
  @MaxLength(50, { message: 'Last name cannot be longer than 50 characters.' })
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'Last name can only contain letters and spaces.',
  })
  declare lastName: string;

  @ApiProperty({ example: '2002-05-11' })
  @IsDateString({}, { message: 'Date of birth must be a valid ISO date.' })
  @IsNotEmpty({ message: 'Date of birth is required.' })
  declare dateOfBirth: string;

  @ApiProperty({ example: 'prachi@example.com' })
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  declare email: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsNotEmpty({ message: 'Password is required.' })
  @IsString({ message: 'Password must be a string.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @MaxLength(100, { message: 'Password cannot be longer than 100 characters.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain uppercase, lowercase and a number.',
  })
  declare password: string;

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
    example: 'Gold',
    description: 'Tier of the seller',
  })
  @IsNotEmpty({ message: 'Tier is required.' })
  @IsEnum(SellerTier, {
    message: 'Tier must be one of the following values: BRONZE, SILVER, GOLD.',
  })
  declare tier: SellerTier;
}
