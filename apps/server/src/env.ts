import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]),
    DATABASE_URL: z.string().url(),
    ADMIN_API_TOKEN: z.string(),
  },

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
