import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('production'),
  ADMIN_EMAIL: Joi.string().email().optional(),
  ADMIN_PASSWORD: Joi.string()
    .when('NODE_ENV', {
      is: 'development',
      then: Joi.string().min(8),
      otherwise: Joi.string().min(12),
    })
    .optional(),
  PORT: Joi.number().default(3000),

  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().required(),

  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().required(),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),

  MAIL_HOST: Joi.string().required(),
  MAIL_PORT: Joi.number().required(),
  MAIL_USER: Joi.string().allow('').optional(),
  MAIL_PASSWORD: Joi.string().allow('').optional(),
  MAIL_FROM: Joi.string().required(),

  THROTTLE_TTL: Joi.number().default(60000),
  THROTTLE_LIMIT: Joi.number().default(10),

  MINIO_ENDPOINT: Joi.string().required(),
  MINIO_PORT: Joi.number().required(),
  MINIO_ACCESS_KEY: Joi.string().required(),
  MINIO_SECRET_KEY: Joi.string().required(),
  MINIO_BUCKET: Joi.string().required(),
  MINIO_USE_SSL: Joi.boolean().default(false),
})
  .and('ADMIN_EMAIL', 'ADMIN_PASSWORD')
  .unknown(true);
