import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const PUBLIC_FILES = ["/", "/manifest.webmanifest", "/icon.svg", "/icon-192.png", "/icon-512.png"];

function precache() {
  let outDir = "dist";
  let built = [];
  return {
    name: "precache",
    apply: "build",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    writeBundle(_options, bundle) {
      built = Object.keys(bundle).map((file) => `/${file}`);
    },
    closeBundle() {
      const path = join(outDir, "sw.js");
      const files = [...new Set([...PUBLIC_FILES, ...built])];
      const version = Date.now().toString(36);
      const source = readFileSync(path, "utf8")
        .replace("__VERSION__", version)
        .replace('"__FILES__"', JSON.stringify(files));
      writeFileSync(path, source);
    },
  };
}

export default defineConfig({
  plugins: [react(), precache()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
    css: false,
  },
});
