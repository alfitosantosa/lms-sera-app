import eslint from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import unusedImports from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "public/**",
      "generated/**",
      "prisma/generated/**",
    ],
  },

  eslint.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}"],

    plugins: {
      "@next/next": nextPlugin,
      "unused-imports": unusedImports,
    },

    rules: {
      // =========================
      // JavaScript / TypeScript
      // =========================

      "no-unused-vars": "off",
      "no-undef": "off",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // =========================
      // Unused Imports
      // =========================

      "unused-imports/no-unused-imports": "error",

      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // =========================
      // Code Quality
      // =========================

      "no-unreachable": "error",
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-self-compare": "error",
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],

      // =========================
      // Next.js
      // =========================

      "@next/next/no-img-element": "warn",
      "@next/next/no-sync-scripts": "error",
      "@next/next/no-document-import-in-page": "error",
      "@next/next/no-head-element": "error",
      "@next/next/no-assign-module-variable": "error",
      "@next/next/no-async-client-component": "error",

      // =========================
      // TypeScript
      // =========================

      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",

      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],

      // =========================
      // General
      // =========================

      "no-console": "off",
    },
  },
);
