import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
  },

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
