export default defineNitroConfig({
  srcDir: "src",
  routeRules: {
    // Cache all API routes for 5 minutes
    "/api/**": {
      // TODO
      // cache: { swr: true, maxAge: 5 * 60, base: "api" },
    },
    // no cache for all /api/root/** routes
    "/api/root/**": { cache: false },
  },
});
