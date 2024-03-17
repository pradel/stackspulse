import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_PATH: z.string().min(1),
    CHAINHOOKS_API_TOKEN: z.string().min(1),
  },
  client: {},
  experimental__runtimeEnv: {},
});
