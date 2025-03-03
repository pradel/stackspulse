import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().url(),
    NEXT_PUBLIC_API_URL: z.string().url(),
    NEXT_PUBLIC_FATHOM_ID: z.string().optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_FATHOM_ID: process.env.NEXT_PUBLIC_FATHOM_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
  emptyStringAsUndefined: true,
});
