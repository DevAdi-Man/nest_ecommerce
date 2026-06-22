import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Length, Matches, MaxLength, MinLength } from "class-validator";

export class ResetPasswordDto {
  //email
  @ApiProperty({
    example: 'aditya@example.com',
  })
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email: string

  // otp
  @ApiProperty({ example: '482913' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits.' })
  otp: string;

  @ApiProperty({ example: 'NewStrongPass123!' })
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
  newPassword: string
}
