import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from 'src/roles/entities/role.entity';
import { User } from 'src/users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt'
import { CreationAttributes } from 'sequelize';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwtPayload.interface';
import { MailService } from 'src/mail/mail.service';
import { OtpService } from 'src/otp/otp.service';
import { OtpType } from 'src/otp/otp.interface';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,

    @InjectModel(Role)
    private readonly roleModel: typeof Role,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    private readonly mailService: MailService,
    private readonly otpService: OtpService
  ) { }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userModel.findOne({
      where: {
        email: registerDto.email
      }
    })

    if (existingUser) throw new ConflictException('Email already exists.')

    const customerRole = await this.roleModel.findOne({
      where: {
        name: 'Customer'
      }
    })

    if (!customerRole) throw new NotFoundException("Customer role not found.")

    const hashedPassword = await this.hashPassword(
      registerDto.password
    )

    const newUser: CreationAttributes<User> = {
      ...registerDto,
      password: hashedPassword,
      roleId: customerRole.id
    }

    const user = await this.userModel.create(newUser)
    try {
      const otp = await this.otpService.createOtp(user.id, OtpType.VERIFY_EMAIL);
      await this.mailService.sendEmail(
        user.email,
        'Verify your email',
        `
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1>${otp}</h1>
      <p>This code expires in 5 minutes.</p>
      `,
      );
    } catch (err) {
      console.error('Failed to send verification email:', err);
    }

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userModel.findOne({
      where: {
        email: loginDto.email
      },
      include: [Role]
    })
    if (!user) throw new UnauthorizedException("User is not authorized.")

    const isPasswordCorrect = await this.comparePassword(loginDto.password, user.password);
    if (!isPasswordCorrect) {
      throw new UnauthorizedException("Invalid email or password")
    }

    if (!user.isVerifiedEmail) {
      throw new UnauthorizedException(
        'Please verify your email before logging in.',
      );
    }
    const { password, refreshToken: _oldRefreshToken, ...safeUser } = user?.toJSON();

    const accessToken = await this.generateAccessToken(user)
    const newRefreshToken = await this.generateRefreshToken(user);

    const hashedRefreshToken = await this.hashPassword(newRefreshToken)
    await user.update({
      refreshToken: hashedRefreshToken
    })
    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: safeUser
    };
  }

  async refresh(payload: JwtPayload) {
    const user = await this.userModel.findByPk(payload.sub, {
      include: [Role]
    })

    if (!user) {
      throw new UnauthorizedException('Access denied.')
    }
    const accessToken = await this.generateAccessToken(user)
    const newRefreshToken = await this.generateRefreshToken(user);

    const hashedRefreshToken = await this.hashPassword(newRefreshToken);
    await user.update({
      refreshToken: hashedRefreshToken
    })

    return {
      accessToken,
      refreshToken: newRefreshToken
    }
  }

  async verifyEmail(
    verifyEmailDto: VerifyEmailDto
  ): Promise<{ message: string }> {
    const user = await this.userModel.findOne({
      where: {
        email: verifyEmailDto.email
      }
    })
    if (!user) throw new UnauthorizedException('User not found')

    if (user.isVerifiedEmail) throw new ConflictException('User is already verified.')

    await this.otpService.verifyOtp(
      user.id,
      verifyEmailDto.otp,
      OtpType.VERIFY_EMAIL,
    );

    await user.update({
      isVerifiedEmail: true,
    });
    return {
      message:
        'Email verified successfully.',
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.userModel.findOne({
      where: {
        email: forgotPasswordDto.email
      }
    })

    if (!user) {
      return {
        message:
          'If an account exists with this email, a password reset email has been sent.',
      };
    }

    if (!user.isVerifiedEmail) throw new UnauthorizedException('Please verify email first.')

    const otp = await this.otpService.createOtp(user.id, OtpType.FORGOT_PASSWORD)
    await this.mailService.sendEmail(
      user.email,
      'Reset your Password',
      `
      <h2>Password Reset</h2>

      <p>Your OTP is:</p>

      <h1>${otp}</h1>

      <p>This OTP expires in 5 minutes.</p>
      `
    )
    return { message: 'Password reset OTP has been sent to your email.', }
  }

  async resetPassword(resetpasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.userModel.findOne({
      where: {
        email: resetpasswordDto.email
      }
    })

    if (!user) {
      return {
        message:
          'If an account exists with this email, a password reset email has been sent.',
      };
    }
    if (!user.isVerifiedEmail) throw new UnauthorizedException('Please verify email first.')

    const isSamePassword = await this.comparePassword(
      resetpasswordDto.newPassword,
      user.password,
    );

    if (isSamePassword) {
      throw new ConflictException(
        'New password must be different from the current password.',
      );
    }

    await this.otpService.verifyOtp(
      user.id,
      resetpasswordDto.otp,
      OtpType.FORGOT_PASSWORD,
    )

    const hashedPassword = await this.hashPassword(resetpasswordDto.newPassword)
    await user.update({
      password: hashedPassword,
      refreshToken: null
    })

    return {
      message: "Password reset successfully."
    }
  }

  async logOut(userId: number): Promise<{ message: string }> {
    const user = await this.userModel.findByPk(userId)
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    await user.update({
      refreshToken: null,
    });

    return {
      message: 'Logged out successfully.',
    };
  }

  async resendVerificationEmail(resendVerificationDto: ResendVerificationDto): Promise<{ message: string }> {
    const user = await this.userModel.findOne({
      where: {
        email: resendVerificationDto.email
      }
    })

    if (!user) {
      return {
        message:
          'If an account exists with this email, a password reset email has been sent.',
      };
    }
    if (!user.isVerifiedEmail) throw new UnauthorizedException('Please verify email first.')

    const otp = await this.otpService.createOtp(
      user.id,
      OtpType.VERIFY_EMAIL,
    );

    await this.mailService.sendEmail(
      user.email,
      'Verify your email',
      `
      <h2>Email Verification</h2>

      <p>Your verification code is:</p>

      <h1>${otp}</h1>

      <p>This code expires in 5 minutes.</p>
    `,
    );

    return {
      message:
        'Verification email sent successfully.',
    };
  }

  async me(userId: number): Promise<Partial<User>> {
    const user = await this.userModel.findByPk(userId, {
      include: [{ model: Role, attributes: ['id', 'name'] }],
      attributes: { exclude: ['password', 'refreshToken'] }
    })
    if (!user) throw new NotFoundException("User not found.")
    if (!user.isVerifiedEmail) throw new UnauthorizedException('Please verify email first.')

    return user
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new NotFoundException('User not found.')
    if (!user.isVerifiedEmail) throw new UnauthorizedException('Please verifi email first.')

    const isOldPasswordCorrect = await this.comparePassword(changePasswordDto.oldPassword, user.password);
    if (!isOldPasswordCorrect) throw new UnauthorizedException('Current password is incorrect.');


    const isSamePassword = await this.comparePassword(changePasswordDto.newPassword, user.password);
    if (isSamePassword) {
      throw new ConflictException('New password must be different from the current password.');
    }

    const hashPassword = await this.hashPassword(changePasswordDto.newPassword)
    await user.update({
      passport: hashPassword,
      refreshToken: null
    })
    return { message: 'Password changed successfully.' };
  }

  private async comparePassword(inputPassword: string, dataBasePassword: string): Promise<boolean> {
    return await bcrypt.compare(
      inputPassword, dataBasePassword
    )
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
  }

  private async generateAccessToken(user: User): Promise<string> {
    if (!user.role) throw new UnauthorizedException('User role not found.');
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };
    return this.jwtService.signAsync(payload);
  }

  private async generateRefreshToken(user: User): Promise<string> {
    if (!user.role) throw new UnauthorizedException('User role not found.');
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') as any,
    });
  }
}
