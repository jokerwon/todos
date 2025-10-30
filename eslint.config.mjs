import globals from "globals";
import nextPlugin from "@next/eslint-plugin-next";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

const nextCoreWebVitals = nextPlugin.configs["core-web-vitals"];

export default [
  {
    ignores: [
      "node_modules",
      ".next",
      "dist",
      "coverage",
      "pnpm-lock.yaml",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextCoreWebVitals.rules,
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-img-element": "off",
      "@next/next/google-font-display": "error",
      "@next/next/google-font-preconnect": "error",
      "@next/next/next-script-for-ga": "error",
    },
  },
];
