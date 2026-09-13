import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmpty,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateAddressDto {
  @ApiPropertyOptional({
    description: 'Address type',
    example: 'Home',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Address Line 1',
    example: 'House No. 123, MG Road',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(1000)
  addressLine1: string;

  @ApiPropertyOptional({
    description: 'Address Line 2',
    example: 'Landmark',
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(1000)
  addressLine2?: string;

  @ApiProperty({
    description: 'City',
    example: 'Gurugram',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @ApiProperty({
    description: 'State',
    example: 'Haryana',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  state: string;

  @ApiProperty({
    description: 'Pincode',
    example: '122001',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  pincode: string;

  @ApiProperty({
    description: 'Country',
    example: 'India',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  country: string;

  @ApiPropertyOptional({
    description: 'Is this address primary',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'Phone number for this address',
    example: '+919876543210',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Latitude',
    example: 28.7041,
  })
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude',
    example: 77.1025,
  })
  @IsOptional()
  longitude?: number;
}
