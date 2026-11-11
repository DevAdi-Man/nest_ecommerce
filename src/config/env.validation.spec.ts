import * as Joi from 'joi';
import { envValidationSchema } from './env.validation';

const adminSchema = Joi.object({
  NODE_ENV: envValidationSchema.extract('NODE_ENV'),
  ADMIN_PASSWORD: envValidationSchema.extract('ADMIN_PASSWORD'),
});

describe('administrator password policy', () => {
  it('accepts a local development password with explicit development mode', () => {
    expect(
      adminSchema.validate({
        NODE_ENV: 'development',
        ADMIN_PASSWORD: 'Admin@123',
      }).error,
    ).toBeUndefined();
  });
  it.each([undefined, 'production', 'test'])(
    'rejects the short password in %s mode',
    (mode) => {
      expect(
        adminSchema.validate({ NODE_ENV: mode, ADMIN_PASSWORD: 'Admin@123' })
          .error,
      ).toBeDefined();
    },
  );
});
