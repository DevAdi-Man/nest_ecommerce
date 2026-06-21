import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Otp } from './entities/otp.entity/otp.entity';

@Module({
  imports: [SequelizeModule.forFeature([Otp])],
  providers: [OtpService],
  exports: [OtpService]
})
export class OtpModule { }
