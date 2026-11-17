import { describe, expect, it, vi } from "vitest";
import { applyMatch, checkGrammar } from "../lib/languagetool";

const reply = (status, body) =>
  vi.fn().mockResolvedValue({ ok: status < 400, status, json: async () => body });

describe("checkGrammar", () => {
  it("maps matches", async () => {
    const fetchImpl = reply(200, {
      matches: [
        { message: "Faute", offset: 3, length: 4, replacements: [{ value: "avec" }, { value: "a" }] },
      ],
    });
    const result = await checkGrammar("Je avec", "fr", fetchImpl);
    expect(result).toEqual([{ message: "Faute", offset: 3, length: 4, replacements: ["avec", "a"] }]);
    const [url, options] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://api.languagetool.org/v2/check");
    expect(options.method).toBe("POST");
  });
  it("does not call the service for empty text", async () => {
    const fetchImpl = vi.fn();
    expect(await checkGrammar("  ", "fr", fetchImpl)).toEqual([]);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
  it("rejects too long text without a request", async () => {
    const fetchImpl = vi.fn();
    await expect(checkGrammar("a".repeat(20001), "fr", fetchImpl)).rejects.toThrow("too_long");
    expect(fetchImpl).not.toHaveBeenCalled();
  });
  it("reports the rate limit", async () => {
    await expect(checkGrammar("bonjour", "fr", reply(429, {}))).rejects.toThrow("rate_limit");
  });
  it("reports other failures", async () => {
    await expect(checkGrammar("bonjour", "fr", reply(500, {}))).rejects.toThrow("failed");
  });
});

describe("applyMatch", () => {
  it("replaces the matched range", () => {
    expect(applyMatch("Je suis etudiant", { offset: 8, length: 8 }, "étudiant")).toBe("Je suis étudiant");
  });
});
