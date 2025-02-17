import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]),
    API_URL: z.string().url(),
    WEB_URL: z.string().url(),
    DATABASE_URL: z.string().url(),
    ADMIN_API_TOKEN: z.string(),
    LOCAL_DATABASE_URL: z.string(),
    SENTRY_DSN: z.string().url().optional(),
    COINGECKO_API_KEY: z.string(),
    TWITTER_API_KEY: z.string().min(1),
    TWITTER_API_SECRET_KEY: z.string().min(1),
    TWITTER_ACCESS_TOKEN: z.string().min(1),
    TWITTER_ACCESS_TOKEN_SECRET: z.string().min(1),
  },

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
