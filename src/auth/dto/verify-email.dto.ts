import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    example: 'aditya@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '482913',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, {
    message: 'OTP must be exactly 6 digits.',
  })
  otp: string;
}
