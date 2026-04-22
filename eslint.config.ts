import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactCompiler from "eslint-plugin-react-compiler";
import reactRefresh from "eslint-plugin-react-refresh";
import importPlugin from "eslint-plugin-import";

// ─────────────────────────────────────────────────────────────────────────────
// ESLint Config
//
// Three critical rule groups:
//   1. react-compiler  — catches Rules of React violations BEFORE the compiler
//                        sees them. Fix all violations here first, then enable
//                        the compiler. Zero violations = zero surprises.
//   2. react-hooks     — still needed; compiler doesn't replace hook rules
//   3. import/no-restricted-paths — enforces the golden architectural rule:
//                        features/ never import from each other.
//                        shared/  never imports from features/.
//                        This is automated so it fails CI, not code review.
// ─────────────────────────────────────────────────────────────────────────────

export default tseslint.config(
  { ignores: ["dist", "node_modules"] },

  // Base JS + TS rules
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    files: ["eslint.config.ts"],
    rules: {
      "@typescript-eslint/no-deprecated": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },

  // React-specific rules
  {
    plugins: {
      "react-hooks": reactHooks,
      "react-compiler": reactCompiler,
      "react-refresh": reactRefresh,
      import: importPlugin,
    },
    rules: {
      // ── React Compiler ────────────────────────────────────────────────────
      // Reports components/hooks that violate Rules of React.
      // The compiler will SKIP these — so fix them, don't suppress them.
      "react-compiler/react-compiler": "error",

      // ── React Hooks ───────────────────────────────────────────────────────
      ...reactHooks.configs.recommended.rules,

      // ── React Refresh (Vite HMR) ──────────────────────────────────────────
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // ── Import Boundaries (the golden architectural rule) ─────────────────
      // features/ must never import from each other directly.
      // If Feature A needs something from Feature B, it belongs in shared/.
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            // auth cannot import from other features
            {
              target: "./src/features/auth",
              from: "./src/features",
              except: ["./auth"],
              message:
                "Features cannot import from other features. Move shared code to src/shared/",
            },
            // dashboard cannot import from other features
            {
              target: "./src/features/dashboard",
              from: "./src/features",
              except: ["./dashboard"],
              message:
                "Features cannot import from other features. Move shared code to src/shared/",
            },
            // data-table cannot import from other features
            {
              target: "./src/features/data-table",
              from: "./src/features",
              except: ["./data-table"],
              message:
                "Features cannot import from other features. Move shared code to src/shared/",
            },
            // settings cannot import from other features
            {
              target: "./src/features/settings",
              from: "./src/features",
              except: ["./settings"],
              message:
                "Features cannot import from other features. Move shared code to src/shared/",
            },
            // shared cannot import from features (one-way dependency)
            {
              target: "./src/shared",
              from: "./src/features",
              message:
                "shared/ cannot import from features/. shared/ must be self-contained.",
            },
          ],
        },
      ],

      // ── TypeScript ────────────────────────────────────────────────────────
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "error", // import type { ... }
      "@typescript-eslint/no-explicit-any": "error",
    },
  },

  {
    files: ["src/router/routes.tsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
);
