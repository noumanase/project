import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

// ─────────────────────────────────────────────────────────────────────────────
// Vite Config
//
// Key decisions:
//   1. React Compiler via @rolldown/plugin-babel (NOT inline babel option —
//      @vitejs/plugin-react v6 dropped Babel in favour of oxc, so the old
//      react({ babel: { plugins: [...] } }) approach no longer works)
//   2. Path aliases for clean imports — @features, @shared, @pages, @router
//   3. sourcemap: true so React Compiler's compiled output is readable in devtools
// ─────────────────────────────────────────────────────────────────────────────

export default defineConfig({
  plugins: [
    react(),
    // React Compiler 1.0 (GA Oct 2025) — handles all memoization automatically.
    // Do NOT manually write useMemo / useCallback / React.memo.
    // Start with mode: 'annotation' while onboarding, switch to 'all' once
    // eslint-plugin-react-compiler reports zero violations.
    babel({
      presets: [
        reactCompilerPreset({
          // 'annotation' = only compiles components you mark with 'use memo'
          // 'all'        = compiles everything (switch to this after ESLint pass)
          compilationMode: "annotation",
          target: "19",
        }),
      ],
    }),
  ],

  resolve: {
    alias: {
      // Path aliases — always use these, never relative ../../ paths
      "@features": new URL("./src/features", import.meta.url).pathname,
      "@shared": new URL("./src/shared", import.meta.url).pathname,
      "@pages": new URL("./src/pages", import.meta.url).pathname,
      "@router": new URL("./src/router", import.meta.url).pathname,
      "@lib": new URL("./src/lib", import.meta.url).pathname,
    },
  },

  build: {
    sourcemap: true, // required for readable compiler output in devtools
  },
});
