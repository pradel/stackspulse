export default defineNitroConfig({
  compatibilityDate: "2025-03-20",
  srcDir: "src",
  esbuild: {
    options: {
      target: "esnext",
    },
  },
});
