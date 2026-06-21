import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { JwtPayload } from './interfaces/jwtPayload.interface';
import { Request as ExpressRequest } from 'express';
import { VerifyEmailDto } from './dto/verify-email.dto';

interface AuthenticatedRequest extends ExpressRequest {
  user: JwtPayload;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
  })
  register(
    @Body() registerDto: RegisterDto,
  ) {
    return this.authService.register(registerDto);
  }


  @Post('login')
  @ApiOperation({
    summary: 'Login a user',
  })
  @ApiResponse({
    status: 201,
    description: 'User login successfully.',
  })
  login(
    @Body() loginDto: LoginDto,
  ) {
    return this.authService.login(loginDto);
  }


  @Post('refresh')
  @ApiOperation({
    summary: 'Generate new access token using refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'New tokens generated successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token.',
  })
  @UseGuards(RefreshAuthGuard)
  refresh(
    @Request() req: AuthenticatedRequest
  ) {
    return this.authService.refresh(req.user);
  }

  @Post('verify-email')
  @ApiOperation({
    summary: 'Verify user email',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully.',
  })
  verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
  ) {
    return this.authService.verifyEmail(
      verifyEmailDto,
    );
  }
}
