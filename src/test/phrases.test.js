import { describe, expect, it } from "vitest";
import { applyFormula, buildSummaries, suggestFormulas } from "../lib/phrases";

describe("suggestFormulas", () => {
  it("suggests a more formal wording in French", () => {
    const found = suggestFormulas("Je suis bon en React et j'ai fait un site.", "fr");
    expect(found.map((f) => f.to)).toEqual(expect.arrayContaining(["je maîtrise", "j'ai réalisé"]));
  });
  it("returns nothing for already formal text", () => {
    expect(suggestFormulas("Je maîtrise React.", "fr")).toEqual([]);
  });
  it("matches words containing accents", () => {
    expect(suggestFormulas("ça marche", "fr")[0].to).toBe("cela");
  });
  it("works in English", () => {
    expect(suggestFormulas("I did a lot of things", "en").length).toBeGreaterThan(0);
  });
  it("never replaces without the explicit apply step", () => {
    const text = "j'aime coder";
    const [s] = suggestFormulas(text, "fr");
    expect(text).toBe("j'aime coder");
    expect(applyFormula(text, s)).toBe("je suis passionné(e) par coder");
  });
});

describe("buildSummaries", () => {
  const input = {
    level: "l3",
    field: "Informatique",
    goal: "internship",
    domain: "développement web",
    strength: "rigueur",
  };
  it("returns three distinct variants in French", () => {
    const v = buildSummaries(input, "fr");
    expect(v).toHaveLength(3);
    expect(new Set(v).size).toBe(3);
    expect(v[0]).toContain("Licence 3");
    expect(v[0]).toContain("développement web");
  });
  it("returns English variants", () => {
    expect(buildSummaries(input, "en")[0]).toContain("internship");
  });
  it("handles empty optional fields without double spaces", () => {
    const v = buildSummaries({ ...input, field: "", domain: "", strength: "" }, "fr");
    v.forEach((text) => expect(text).not.toMatch(/\s{2,}| ,| \./));
  });
});
