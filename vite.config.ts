import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";

const target = process.env.TARGET || "chrome";
const targetBrowser = process.env.TARGET_BROWSER || "chrome";
const chromiumBinary = process.env.CHROMIUM_BINARY || "/usr/bin/google-chrome";
const outDir = process.env.OUT_DIR || `../dist/${target}`;

function generateManifest() {
  const manifest = readJsonFile("manifest.json");
  const pkg = readJsonFile("package.json");
  return {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    ...manifest,
  };
}

export default defineConfig({
  root: 'src', 
  define: {
    __BROWSER__: JSON.stringify(target),
  },
  build:{
    outDir,
    emptyOutDir: true
  },
  plugins: [
    tailwindcss(),
    webExtension({
      browser: targetBrowser,
      manifest: generateManifest,
      additionalInputs: ["timeline/timeline.html"],
      watchFilePaths: ["package.json", "manifest.json"],
      webExtConfig: {
        target: "chromium",
        chromiumBinary,
      },
    }),
  ],
});
