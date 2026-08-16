import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'staging', 'production', 'test').default('development'),
  PORT: Joi.number().default(4000),
  API_PREFIX: Joi.string().default('api/v1'),

  MONGODB_URI: Joi.string().required(),

  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_TTL: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_TTL: Joi.string().default('7d'),

  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
  CLOUDINARY_ROOT_FOLDER: Joi.string().default('somoyon'),

  GOOGLE_CLIENT_ID: Joi.string().allow('').optional(),
  GOOGLE_ALLOWED_EMAILS: Joi.string().allow('').optional(),
  GOOGLE_HOSTED_DOMAIN: Joi.string().allow('').optional(),

  CORS_ORIGINS: Joi.string().default('http://localhost:5173'),
  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),
  CACHE_TTL: Joi.number().default(300),

  SMTP_HOST: Joi.string().allow('').optional(),
  SMTP_PORT: Joi.number().optional(),
  SMTP_USER: Joi.string().allow('').optional(),
  SMTP_PASS: Joi.string().allow('').optional(),
  MAIL_FROM: Joi.string().allow('').optional(),
  CONTACT_NOTIFY_TO: Joi.string().allow('').optional(),

  SEED_ADMIN_EMAIL: Joi.string().allow('').optional(),
  SEED_ADMIN_PASSWORD: Joi.string().allow('').optional(),
  SEED_ADMIN_NAME: Joi.string().allow('').optional(),
  SWAGGER_USER: Joi.string().allow('').optional(),
  SWAGGER_PASSWORD: Joi.string().allow('').optional(),
}).unknown(true);
