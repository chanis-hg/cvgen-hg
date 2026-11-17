import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { compressPhoto, exceedsPixels, fitSize } from "../lib/image";

describe("fitSize", () => {
  it("crops a landscape image to a centered square and shrinks it to 400", () => {
    expect(fitSize(2000, 1000)).toEqual({ side: 400, sx: 500, sy: 0, sourceSide: 1000 });
  });
  it("does not enlarge small images", () => {
    expect(fitSize(200, 300)).toEqual({ side: 200, sx: 0, sy: 50, sourceSide: 200 });
  });
});

describe("exceedsPixels", () => {
  it("accepts a normal photo and refuses a huge one", () => {
    expect(exceedsPixels(4000, 3000)).toBe(false);
    expect(exceedsPixels(10000, 10000)).toBe(true);
  });
});

describe("compressPhoto", () => {
  let revoked;
  let imageSize;
  let imageFails;
  let toDataURL;

  beforeEach(() => {
    revoked = 0;
    imageSize = { w: 800, h: 600 };
    imageFails = false;
    toDataURL = () => "data:image/jpeg;base64,AAAA";
    URL.createObjectURL = () => "blob:test";
    URL.revokeObjectURL = () => {
      revoked += 1;
    };
    vi.stubGlobal(
      "Image",
      class {
        set src(value) {
          if (!value) return;
          setTimeout(() => {
            if (imageFails) this.onerror?.();
            else {
              this.naturalWidth = imageSize.w;
              this.naturalHeight = imageSize.h;
              this.onload?.();
            }
          });
        }
      },
    );
    const realCreate = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag) =>
      tag === "canvas"
        ? {
            getContext: () => ({ fillRect() {}, drawImage() {} }),
            toDataURL: (...args) => toDataURL(...args),
          }
        : realCreate(tag),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const image = () => new File(["x"], "p.jpg", { type: "image/jpeg" });

  it("returns a jpeg data URL and releases the object URL", async () => {
    await expect(compressPhoto(image())).resolves.toMatch(/^data:image\/jpeg/);
    expect(revoked).toBe(1);
  });
  it("refuses files that are not images before reading them", async () => {
    await expect(compressPhoto(new File(["x"], "a.pdf", { type: "application/pdf" }))).rejects.toThrow(
      "type",
    );
    expect(revoked).toBe(0);
  });
  it("refuses images with too many pixels and releases the URL", async () => {
    imageSize = { w: 10000, h: 10000 };
    await expect(compressPhoto(image())).rejects.toThrow("pixels");
    expect(revoked).toBe(1);
  });
  it("releases the URL when the canvas fails", async () => {
    toDataURL = () => {
      throw new Error("canvas");
    };
    await expect(compressPhoto(image())).rejects.toThrow("read");
    expect(revoked).toBe(1);
  });
  it("releases the URL when the image cannot be decoded", async () => {
    imageFails = true;
    await expect(compressPhoto(image())).rejects.toThrow("read");
    expect(revoked).toBe(1);
  });
  it("lowers the quality when the first result is too heavy", async () => {
    const heavy = "data:image/jpeg;base64," + "A".repeat(400000);
    toDataURL = (type, quality) => (quality === 0.8 ? heavy : "data:image/jpeg;base64,AAAA");
    await expect(compressPhoto(image())).resolves.toBe("data:image/jpeg;base64,AAAA");
  });
});
