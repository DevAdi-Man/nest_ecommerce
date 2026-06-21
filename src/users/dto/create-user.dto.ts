import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsString({ message: 'Avatar must be a string.' })
  avatar?: string;

  @IsString({ message: 'First name must be a string.' })
  @IsNotEmpty({ message: 'First name is required.' })
  @MinLength(3, { message: 'First name must be at least 3 characters long.' })
  @MaxLength(50, { message: 'First name cannot be longer than 50 characters.' })
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'First name can only contain letters and spaces.',
  })
  firstName: string;

  @IsOptional()
  @IsString({ message: 'Middle name must be a string.' })
  @MaxLength(50, { message: 'Middle name cannot be longer than 50 characters.' })
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'Middle name can only contain letters and spaces.',
  })
  middleName?: string;

  @IsString({ message: 'Last name must be a string.' })
  @IsNotEmpty({ message: 'Last name is required.' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long.' })
  @MaxLength(50, { message: 'Last name cannot be longer than 50 characters.' })
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'Last name can only contain letters and spaces.',
  })
  lastName: string;

  @IsDateString({}, { message: 'Date of birth must be a valid ISO date.' })
  @IsNotEmpty({ message: 'Date of birth is required.' })
  dateOfBirth: string;

  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email: string;

  @IsNotEmpty({ message: 'Password is required.' })
  @IsString({ message: 'Password must be a string.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @MaxLength(100, { message: 'Password cannot be longer than 100 characters.' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    {
      message:
        'Password must contain uppercase, lowercase and a number.',
    },
  )
  password: string;

  @IsNotEmpty({ message: 'Role ID is required.' })
  @IsInt({ message: 'Role ID must be an integer.' })
  @Min(1, { message: 'Role ID must be greater than 0.' })
  roleId: number;
}
