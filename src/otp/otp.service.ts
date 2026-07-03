import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { Otp } from './entities/otp.entity/otp.entity';
import { OtpType } from './otp.interface';
import { Op } from 'sequelize';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(Otp)
    private readonly otpModel: typeof Otp,
  ) {}

  async createOtp(userId: number, type: OtpType): Promise<string> {
    const otp = this.genrateOtp();

    const hashOtp = await this.hashOtp(otp);

    const expiresAt = this.getExpiryTime();

    // delete old one first
    await this.otpModel.destroy({
      where: {
        userId,
        type,
        isUsed: false,
      },
    });

    // saved new otp
    await this.otpModel.create({
      userId,
      otp: hashOtp,
      type,
      expiresAt,
    });
    return otp;
  }

  async verifyOtp(userId: number, otp: string, type: OtpType): Promise<void> {
    const savedOtp = await this.otpModel.findOne({
      where: {
        userId,
        type,
        isUsed: false,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
      order: [['createdAt', 'DESC']],
    });

    if (!savedOtp)
      throw new UnauthorizedException('Otp is invalid or expired.');

    const isValid = await bcrypt.compare(otp, savedOtp.otp);

    if (!isValid) throw new UnauthorizedException('Invalid OTP.');

    await savedOtp.update({
      isUsed: false,
    });
  }

  private genrateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async hashOtp(otp: string): Promise<string> {
    return bcrypt.hash(otp, 10);
  }

  private getExpiryTime(minutes = 5): Date {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + minutes);

    return expiresAt;
  }
}
