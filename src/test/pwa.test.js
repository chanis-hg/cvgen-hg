import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path) => readFileSync(path, "utf8");
const manifest = JSON.parse(read("public/manifest.webmanifest"));

describe("installable app files", () => {
  it("has the fields a browser needs to offer installation", () => {
    expect(manifest.name).toBeTruthy();
    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");
  });

  it("points to icons that really exist", () => {
    for (const icon of manifest.icons) {
      expect(existsSync(`public${icon.src}`), icon.src).toBe(true);
    }
  });

  it("offers a 192 and a 512 pixel icon", () => {
    const sizes = manifest.icons.map((icon) => icon.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
  });

  it("is linked from the page", () => {
    expect(read("index.html")).toContain('href="/manifest.webmanifest"');
  });

  it("keeps the placeholders the build fills in the service worker", () => {
    const worker = read("public/sw.js");
    expect(worker).toContain("__VERSION__");
    expect(worker).toContain('"__FILES__"');
  });
});
