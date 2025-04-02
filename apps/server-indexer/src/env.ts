import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  emptyStringAsUndefined: true,
  // @ts-expect-error types are not properly inferred by nitro
  runtimeEnv: import.meta.env,

  server: {
    NODE_ENV: z.enum(["production", "development"]),
    // The URL to the Postgres database
    DATABASE_URL: z.string().url(),
    // The URL to the API server
    API_URL: z.string().url(),
    // Only used in development, the URL to proxy the various webhooks we receive
    WEBHOOK_PROXY_URL: z.string().url().optional(),
    // The API key for the Hiro services
    HIRO_API_KEY: z.string(),
    // The key used to verify the chainhooks bearer token
    CHAINHOOK_API_TOKEN: z.string(),
  },
});
