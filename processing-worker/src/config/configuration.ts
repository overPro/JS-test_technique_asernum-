import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export default registerAs('config', () => {
  const schema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production').default('development'),
    DATABASE_URL: Joi.string().required(),
    REDIS_HOST: Joi.string().default('localhost'),
    REDIS_PORT: Joi.number().default(6379),
    REDIS_DB: Joi.number().default(0),
    JWT_SECRET: Joi.string().default('test-secret-key'),
  });

  const { error, value } = schema.unknown(true).validate(process.env);

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return value;
});
