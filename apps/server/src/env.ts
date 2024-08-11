import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]),
    DATABASE_URL: z.string().url(),
    ADMIN_API_TOKEN: z.string(),
    TURSO_DATABASE_URL: z.string().url(),
    TURSO_AUTH_TOKEN: z.string().optional(),
    SENTRY_DSN: z.string().url().optional(),
  },

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
