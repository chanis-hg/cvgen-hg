import { describe, expect, it } from "vitest";
import { EMPTY_DATA } from "../data/model";
import {
  displayUrl,
  hasCvContent,
  hasFigures,
  isEmail,
  isPhone,
  isUrl,
  mailHref,
  runChecks,
  telHref,
  toHref,
  validateIdentity,
} from "../lib/validate";

describe("field validators", () => {
  it("validates emails", () => {
    expect(isEmail("aicha@exemple.com")).toBe(true);
    expect(isEmail("aicha@exemple")).toBe(false);
    expect(isEmail("aicha exemple.com")).toBe(false);
  });
  it("validates phones with Beninese and international formats", () => {
    expect(isPhone("+229 01 97 00 00 00")).toBe(true);
    expect(isPhone("97000000")).toBe(true);
    expect(isPhone("12")).toBe(false);
    expect(isPhone("abcdefghij")).toBe(false);
  });
  it("validates urls with or without protocol", () => {
    expect(isUrl("github.com/aicha")).toBe(true);
    expect(isUrl("https://monsite.bj")).toBe(true);
    expect(isUrl("pas un lien")).toBe(false);
  });
  it("builds links", () => {
    expect(toHref("github.com/a")).toBe("https://github.com/a");
    expect(toHref("http://x.com")).toBe("http://x.com");
    expect(displayUrl("https://github.com/a/")).toBe("github.com/a");
  });
  it("builds a mailto only from a real address", () => {
    expect(mailHref("aicha@exemple.com")).toBe("mailto:aicha@exemple.com");
    expect(mailHref("  aicha@exemple.com  ")).toBe("mailto:aicha@exemple.com");
    expect(mailHref("aicha@exemple")).toBe(null);
    expect(mailHref("")).toBe(null);
  });
  it("strips spacing and punctuation out of a tel: link", () => {
    expect(telHref("+229 01 97 00 00 00")).toBe("tel:+2290197000000");
    expect(telHref("97 00 00 00")).toBe("tel:97000000");
    expect(telHref("(229) 01-97-00-00-00")).toBe("tel:2290197000000");
    expect(telHref("12")).toBe(null);
    expect(telHref("")).toBe(null);
  });
});

describe("validateIdentity", () => {
  it("flags required fields", () => {
    expect(validateIdentity(EMPTY_DATA)).toEqual({
      firstName: "required",
      lastName: "required",
      jobTitle: "required",
      email: "required",
    });
  });
  it("flags invalid optional fields only when filled", () => {
    const errors = validateIdentity({
      ...EMPTY_DATA,
      firstName: "A",
      lastName: "B",
      jobTitle: "C",
      email: "a@b.cc",
      phone: "12",
      github: "oups",
    });
    expect(errors).toEqual({ phone: "invalid", github: "invalid" });
  });
});

describe("runChecks", () => {
  const full = {
    ...EMPTY_DATA,
    firstName: "A",
    lastName: "B",
    jobTitle: "Dev",
    email: "a@b.cc",
    phone: "97000000",
    summary: "x".repeat(100),
    education: [{ id: "1" }],
    experiences: [{ id: "2" }],
    skills: [{ id: "a" }, { id: "b" }, { id: "c" }],
    photo: "data:image/jpeg;base64,AA",
  };
  it("passes everything for a complete CV", () => {
    expect(runChecks(full, { pages: 1, region: "benin" }).every((c) => c.ok)).toBe(true);
  });
  it("counts a project as experience", () => {
    const checks = runChecks({ ...full, experiences: [], projects: [{ id: "p" }] });
    expect(checks.find((c) => c.id === "experience").ok).toBe(true);
  });
  it("fails the page check beyond one page", () => {
    expect(runChecks(full, { pages: 2 }).find((c) => c.id === "pages").ok).toBe(false);
  });
  it("stays quiet about figures until something is described", () => {
    expect(runChecks(full).some((c) => c.id === "figures")).toBe(false);
  });
  it("asks for a figure once a mission is described without one", () => {
    const described = {
      ...full,
      experiences: [{ id: "2", description: "Correction des anomalies signalées." }],
      projects: [],
    };
    expect(runChecks(described).find((c) => c.id === "figures").ok).toBe(false);
  });
  it("accepts a figure found in an experience or a project", () => {
    const withFigure = {
      ...full,
      experiences: [{ id: "2", description: "Correction de 20 anomalies." }],
      projects: [],
    };
    expect(runChecks(withFigure).find((c) => c.id === "figures").ok).toBe(true);
    expect(
      hasFigures({
        ...full,
        experiences: [{ id: "2", description: "Sans chiffre." }],
        projects: [{ id: "p", description: "Utilisé par 30 étudiants." }],
      }),
    ).toBe(true);
  });
  it("only asks for a photo in Benin mode", () => {
    const noPhoto = { ...full, photo: null };
    expect(runChecks(noPhoto, { region: "international" }).some((c) => c.id === "photo")).toBe(false);
    expect(runChecks(noPhoto, { region: "benin" }).find((c) => c.id === "photo").ok).toBe(false);
  });
});

describe("hasCvContent", () => {
  it("rejects an empty CV", () => {
    expect(hasCvContent(EMPTY_DATA)).toBe(false);
  });
  it("rejects a CV with only a name", () => {
    expect(hasCvContent({ ...EMPTY_DATA, firstName: "Aïcha", lastName: "DOSSOU" })).toBe(false);
  });
  it("rejects content without a name", () => {
    expect(hasCvContent({ ...EMPTY_DATA, summary: "Étudiante en informatique." })).toBe(false);
  });
  it("accepts a name with one section", () => {
    expect(hasCvContent({ ...EMPTY_DATA, firstName: "Aïcha", jobTitle: "Développeuse" })).toBe(true);
  });
});
