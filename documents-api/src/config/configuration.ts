import { registerAs } from "@nestjs/config";
import * as Joi from "joi";

export default registerAs("config", () => {
  const schema = Joi.object({
    NODE_ENV: Joi.string()
      .valid("development", "production")
      .default("development"),
    LOG_LEVEL: Joi.string().default("debug"),
    PORT: Joi.number().default(3001),
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRY: Joi.string().default("7d"),
    REDIS_HOST: Joi.string().default("redis"),
    REDIS_PORT: Joi.number().default(6379),
    REDIS_DB: Joi.number().default(0),

    UPLOAD_BASE_DIR: Joi.string().default("./uploads"),
    UPLOAD_MAX_SIZE_MB: Joi.number().default(50),
    UPLOAD_ALLOWED_TYPES: Joi.string().default(
      "application/pdf,image/jpeg,image/png,text/plain",
    ),
    USER_QUOTA_MB: Joi.number().default(100),
    SHARING_API_URL: Joi.string().default("http://localhost:3002"),
  });

  const { error, value } = schema.unknown(true).validate(process.env);

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return value;
});
