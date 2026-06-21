import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({
    example: 'aditya@example.com',
  })
  @IsEmail()
  email: string;
}
