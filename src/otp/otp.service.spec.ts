import { OtpService } from './otp.service';
import { Otp } from './entities/otp.entity/otp.entity';
import { OtpType } from './otp.interface';
import * as bcrypt from 'bcrypt';

describe('OTP verification', () => {
  it('rejects a wrong code without consuming the OTP', async () => {
    const saved = { otp: await bcrypt.hash('123456', 4), update: jest.fn() };
    const service = new OtpService({
      findOne: jest.fn().mockResolvedValue(saved),
    } as unknown as typeof Otp);
    await expect(
      service.verifyOtp(1, '000000', OtpType.VERIFY_EMAIL),
    ).rejects.toThrow('Invalid OTP');
    expect(saved.update).not.toHaveBeenCalled();
  });
  it('rejects a missing or expired OTP', async () => {
    const service = new OtpService({
      findOne: jest.fn().mockResolvedValue(null),
    } as unknown as typeof Otp);
    await expect(
      service.verifyOtp(1, '123456', OtpType.VERIFY_EMAIL),
    ).rejects.toThrow('expired');
  });
});
