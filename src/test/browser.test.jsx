import { describe, expect, it } from "vitest";
import { isInAppBrowser } from "../lib/browser";

describe("isInAppBrowser", () => {
  it("detects the Facebook in-app browser", () => {
    expect(isInAppBrowser("Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 [FBAN/EMA;FBAV/400.0]")).toBe(
      true,
    );
  });
  it("detects an Android webview", () => {
    expect(
      isInAppBrowser("Mozilla/5.0 (Linux; Android 13; SM-A135F; wv) AppleWebKit/537.36 Chrome/120 Mobile"),
    ).toBe(true);
  });
  it("accepts a regular Chrome", () => {
    expect(
      isInAppBrowser(
        "Mozilla/5.0 (Linux; Android 13; SM-A135F) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36",
      ),
    ).toBe(false);
  });
});
