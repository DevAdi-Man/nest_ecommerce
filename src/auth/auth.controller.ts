import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { JwtPayload } from './interfaces/jwtPayload.interface';
import { Request as ExpressRequest } from 'express';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

interface AuthenticatedRequest extends ExpressRequest {
  user: JwtPayload;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login a user',
  })
  @ApiResponse({
    status: 200,
    description: 'User login successfully.',
  })
  login(@Body() loginDto: LoginDto) {
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
  refresh(@Request() req: AuthenticatedRequest) {
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
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Send password reset OTP',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset OTP sent successfully.',
  })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset user password',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully.',
  })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Logout user',
  })
  logout(@Request() req: AuthenticatedRequest) {
    return this.authService.logOut(req.user.sub);
  }
  @Post('resend-verification')
  @ApiOperation({
    summary: 'Resend verification email',
  })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully.',
  })
  resendVerificationEmail(
    @Body()
    resendVerificationDto: ResendVerificationDto,
  ) {
    return this.authService.resendVerificationEmail(resendVerificationDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  me(@Request() req: AuthenticatedRequest) {
    return this.authService.me(req.user.sub);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Change current password',
  })
  @ApiBearerAuth('access-token')
  changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.sub, changePasswordDto);
  }
}
