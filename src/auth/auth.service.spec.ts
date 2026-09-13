import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { OtpService } from '../otp/otp.service';
import { SmsService } from '../sms/sms.service';
import { getModelToken } from '@nestjs/sequelize';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User), useValue: {} },
        { provide: getModelToken(Role), useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: ConfigService, useValue: {} },
        { provide: MailService, useValue: {} },
        { provide: SmsService, useValue: {} },
        { provide: OtpService, useValue: {} }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
