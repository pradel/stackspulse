import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    sortImports: false,
  },
  lint: {
    overrides: [
      {
        // The rules of `eslint-config-next/core-web-vitals`, in Oxlint.
        files: ["apps/web/**"],
        plugins: ["react", "jsx-a11y", "nextjs"],
        rules: {
          "react/rules-of-hooks": "error",
          "react/exhaustive-deps": "warn",
          "nextjs/no-html-link-for-pages": "error",
          "nextjs/no-sync-scripts": "error",
          "jsx-a11y/alt-text": "warn",
          "jsx-a11y/aria-props": "warn",
          "jsx-a11y/aria-proptypes": "warn",
          "jsx-a11y/aria-unsupported-elements": "warn",
          "jsx-a11y/role-has-required-aria-props": "warn",
          "jsx-a11y/role-supports-aria-props": "warn",
        },
      },
      {
        // `ImageResponse` renders plain `<img>`; `next/image` does not work there.
        files: ["apps/web/src/app/**/opengraph-image.tsx"],
        plugins: ["nextjs"],
        rules: { "nextjs/no-img-element": "off" },
      },
      {
        // Vendored Tremor charts, kept as published.
        files: ["apps/web/src/components/ui/**"],
        plugins: ["react", "jsx-a11y"],
        rules: {
          "react/set-state-in-effect": "off",
          "jsx-a11y/click-events-have-key-events": "off",
          "jsx-a11y/no-noninteractive-element-interactions": "off",
          "jsx-a11y/no-noninteractive-tabindex": "off",
        },
      },
    ],
  },
  run: {
    cache: true,
  },
});
