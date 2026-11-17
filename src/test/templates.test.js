import { describe, expect, it } from "vitest";
import { SITUATIONS, TEMPLATES, TEMPLATE_IDS, getTemplate, recommend, templatesFor } from "../data/templates";

const KNOWN = ["summary", "education", "certifications", "projects", "experience", "skills", "languages"];

describe("templates", () => {
  it("has the five models", () => {
    expect(TEMPLATE_IDS).toEqual(["stage", "chrono", "hybride", "dev", "vitrine"]);
  });
  it("only uses known sections", () => {
    for (const tpl of Object.values(TEMPLATES)) {
      const all = tpl.layout === "two" ? [...tpl.aside, ...tpl.main] : tpl.sections;
      all.forEach((s) => expect(KNOWN).toContain(s));
    }
  });
  it("flags only the two-column model as not ATS-safe", () => {
    expect(TEMPLATE_IDS.filter((id) => !TEMPLATES[id].atsSafe)).toEqual(["vitrine"]);
  });
  it("falls back to the first model for unknown ids", () => {
    expect(getTemplate("nope").id).toBe("stage");
  });
  it("offers at least one model per situation", () => {
    SITUATIONS.forEach((s) => expect(templatesFor(s).length).toBeGreaterThan(0));
    expect(templatesFor("all")).toHaveLength(5);
  });
  it("recommends sensibly", () => {
    expect(recommend({ status: "student", field: "other", sendMode: "form" })).toBe("stage");
    expect(recommend({ status: "student", field: "tech", sendMode: "form" })).toBe("dev");
    expect(recommend({ status: "worker", field: "creative", sendMode: "direct" })).toBe("vitrine");
    expect(recommend({ status: "change", field: "other", sendMode: "form" })).toBe("hybride");
    expect(recommend({ status: "worker", field: "other", sendMode: "form" })).toBe("chrono");
  });
});
