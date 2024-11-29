export default defineNitroConfig({
  compatibilityDate: "2024-11-01",
  srcDir: "src",
  routeRules: {
    // no cache for all /api/root/** routes
    "/api/root/**": { cache: false },
  },
});
