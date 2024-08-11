export default defineNitroConfig({
  srcDir: "src",
  routeRules: {
    // no cache for all /api/root/** routes
    "/api/root/**": { cache: false },
  },
});
