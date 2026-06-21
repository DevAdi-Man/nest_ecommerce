import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsDateString,
} from 'class-validator';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, [
    'email',
    'roleId',
  ] as const),
) {
  @IsOptional()
  @IsString({ message: 'Avatar must be a string.' })
  avatar?: string;

  @IsOptional()
  @IsString({ message: 'First name must be a string.' })
  @MinLength(3, { message: 'First name must be at least 3 characters long.' })
  @MaxLength(50, { message: 'First name cannot be longer than 50 characters.' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Middle name must be a string.' })
  @MaxLength(50, { message: 'Middle name cannot be longer than 50 characters.' })
  middleName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string.' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long.' })
  @MaxLength(50, { message: 'Last name cannot be longer than 50 characters.' })
  lastName?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid ISO date.' })
  dateOfBirth?: string;

  @IsOptional()
  @IsString({ message: 'Password must be a string.' })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  @MaxLength(100, { message: 'Password cannot be longer than 100 characters.' })
  password?: string;
}
