import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export default registerAs('config', () => {
  const schema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production').default('development'),
    LOG_LEVEL: Joi.string().default('debug'),
    PORT: Joi.number().default(3002),
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRY: Joi.string().default('7d'),
    SHARE_LINK_EXPIRY_HOURS: Joi.number().default(24),
    SHARE_LINK_TOKEN_LENGTH: Joi.number().default(32),
    DOCUMENTS_API_URL: Joi.string().default('http://localhost:3001'),
  });

  const { error, value } = schema.unknown(true).validate(process.env);

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return value;
});
