import { env } from "@/env";
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  debug: false,
  spotlight: process.env.NODE_ENV === "development",
});