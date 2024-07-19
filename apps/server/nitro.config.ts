export default defineNitroConfig({
  srcDir: "src",
  routeRules: {
    // Cache all API routes for 5 minutes
    "/api/**": { cache: { swr: true, maxAge: 5 * 60 } },
    // no cache for all /api/root/** routes
    "/api/root/**": { cache: false },
  },
});
