/// <reference types="vitest" />
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// GitHub Pages serves a project site from /<repo-name>/, so production builds
// need a base path. We DON'T hardcode the repo name here because the repo
// hasn't been created yet — set VITE_BASE_PATH (e.g. "/pnw-repair-uploader/")
// in the GitHub Actions environment once the repo name is decided. During
// `npm run dev` the base is always "/".
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    base: mode === "production" ? env.VITE_BASE_PATH || "/" : "/",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      strictPort: true, // the OAuth redirect URI is pinned to localhost:5173
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      css: false,
    },
  };
});
