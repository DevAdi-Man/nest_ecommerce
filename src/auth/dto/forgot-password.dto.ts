import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class ForgotPasswordDto {

  @ApiProperty({
    example: 'aditya@example.com',
  })
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email: string;
}
