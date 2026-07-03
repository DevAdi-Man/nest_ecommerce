import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Profile picture URL',
  })
  @IsOptional()
  @IsUrl(
    {},
    {
      message: 'Avatar must be a valid URL.',
    },
  )
  avatar?: string;

  @ApiProperty({
    example: 'Aditya',
  })
  @IsString({ message: 'First name must be a string.' })
  @IsNotEmpty({ message: 'First name is required.' })
  @MinLength(3, { message: 'First name must be at least 3 characters long.' })
  @MaxLength(50, { message: 'First name cannot be longer than 50 characters.' })
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'First name can only contain letters and spaces.',
  })
  firstName: string;

  @ApiPropertyOptional({
    example: 'Raj',
  })
  @IsOptional()
  @IsString({ message: 'Middle name must be a string.' })
  @MaxLength(50, {
    message: 'Middle name cannot be longer than 50 characters.',
  })
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'Middle name can only contain letters and spaces.',
  })
  middleName?: string;

  @ApiProperty({
    example: 'Sharma',
  })
  @IsString({ message: 'Last name must be a string.' })
  @IsNotEmpty({ message: 'Last name is required.' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long.' })
  @MaxLength(50, { message: 'Last name cannot be longer than 50 characters.' })
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'Last name can only contain letters and spaces.',
  })
  lastName: string;

  @ApiProperty({
    example: '2002-05-11',
  })
  @IsDateString({}, { message: 'Date of birth must be a valid ISO date.' })
  @IsNotEmpty({ message: 'Date of birth is required.' })
  dateOfBirth: string;

  @ApiProperty({
    example: 'aditya@example.com',
  })
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email: string;

  @ApiProperty({
    example: 'Admin@123',
  })
  @IsNotEmpty({ message: 'Password is required.' })
  @IsString({ message: 'Password must be a string.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @MaxLength(100, { message: 'Password cannot be longer than 100 characters.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain uppercase, lowercase and a number.',
  })
  password: string;
}
