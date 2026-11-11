import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RefreshStrategy } from './strategies/refresh.strategy/refresh.strategy';
import { User } from 'src/users/entities/user.entity';
import { MailService } from 'src/mail/mail.service';
import { OtpService } from 'src/otp/otp.service';
import { Role } from 'src/roles/entities/role.entity';
import * as bcrypt from 'bcrypt';

describe('refresh token rotation', () => {
  it('rejects the previous token after rotation, including concurrent reuse', async () => {
    const jwt = new JwtService({
      secret: 'access-test',
      signOptions: { expiresIn: '1h' },
    });
    const config = new ConfigService({
      JWT_REFRESH_SECRET: 'refresh-test',
      JWT_REFRESH_EXPIRES_IN: '7d',
    });
    const user = {
      id: 1,
      email: 'test@example.com',
      role: { name: 'Customer' },
      isVerifiedEmail: true,
      password: await bcrypt.hash('Password123!', 4),
      refreshToken: null as string | null,
      toJSON: () => ({ id: 1 }),
      update: jest.fn(async (values): Promise<void> => {
        Object.assign(user, values);
      }),
    };
    const model = {
      findOne: jest.fn(async () => user),
      findByPk: jest.fn(async () => user),
      update: jest.fn(async (values, options) => {
        if (user.refreshToken !== options.where.refreshToken) return [0];
        Object.assign(user, values);
        return [1];
      }),
    };
    const service = new AuthService(
      model as unknown as typeof User,
      {} as typeof Role,
      jwt,
      config,
      {} as MailService,
      {} as OtpService,
    );
    const strategy = new RefreshStrategy(
      config,
      model as unknown as typeof User,
    );
    const login = await service.login({
      email: user.email,
      password: 'Password123!',
    });
    const payload = { sub: 1, email: user.email, role: 'Customer' };
    const results = await Promise.allSettled([
      service.refresh(payload, login.refreshToken),
      service.refresh(payload, login.refreshToken),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const success = results.find(
      (r) => r.status === 'fulfilled',
    ) as PromiseFulfilledResult<{ refreshToken: string }>;
    expect(success.value.refreshToken).not.toBe(login.refreshToken);
    await expect(
      strategy.validate(
        { body: { refreshToken: login.refreshToken } },
        payload,
      ),
    ).rejects.toThrow();
    await expect(
      service.refresh(payload, login.refreshToken),
    ).rejects.toThrow();
    await expect(
      strategy.validate(
        { body: { refreshToken: success.value.refreshToken } },
        payload,
      ),
    ).resolves.toEqual(payload);
  });
});
