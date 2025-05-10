export default defineNitroConfig({
  compatibilityDate: "2025-05-10",
  srcDir: "src",
  routeRules: {
    // no cache for all /api/root/** routes
    "/api/root/**": { cache: false },
  },
});
