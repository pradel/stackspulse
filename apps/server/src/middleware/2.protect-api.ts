import { env } from "~/env";

export default defineEventHandler((event) => {
  // Only apply for /api/root/** routes
  if (event.path.startsWith("/api/root")) {
    const authorization = event.headers.get("Authorization") || "";
    const [scheme, token] = authorization.split(" ");
    if (scheme !== "Bearer" || token !== env.ADMIN_API_TOKEN) {
      throw createError({
        status: 401,
        message: "authentication failed",
      });
    }
  }
});
