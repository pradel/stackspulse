// Inspired by https://www.lichter.io/articles/nuxt3-sentry-recipe/
import * as Sentry from "@sentry/node";
import { H3Error } from "h3";
import { env } from "~/env";

const ignoreErrors = [
  401, // Unauthorized
  404, // Not Found
  422, // Unprocessable Entity
];

export default defineNitroPlugin((nitroApp) => {
  Sentry.init({
    dsn: env.SENTRY_DSN,
  });

  nitroApp.hooks.hook("request", (event) => {
    event.context.$sentry = Sentry;
  });

  nitroApp.hooks.hook("error", (error) => {
    // Do not report some errors to Sentry
    if (error instanceof H3Error && ignoreErrors.includes(error.statusCode)) {
      return;
    }

    Sentry.captureException(error);
  });

  // closing Sentry on shutdown
  nitroApp.hooks.hookOnce("close", async () => {
    await Sentry.close(2000);
  });
});
