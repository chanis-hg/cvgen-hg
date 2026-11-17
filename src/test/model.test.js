import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  EMPTY_DATA,
  STORAGE_KEY,
  exportJson,
  importJson,
  loadState,
  normalizeData,
  normalizeSettings,
  pdfFileName,
  saveState,
  detectLang,
  LIMITS,
} from "../data/model";

function fakeStorage(initial = {}) {
  const store = { ...initial };
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => {
      store[k] = v;
    },
  };
}

describe("normalizeData", () => {
  it("returns empty data for invalid input", () => {
    expect(normalizeData(null)).toEqual(EMPTY_DATA);
    expect(normalizeData("x")).toEqual(EMPTY_DATA);
  });

  it("keeps strings, drops wrong types and adds ids to list items", () => {
    const data = normalizeData({
      firstName: "Aicha",
      lastName: 5,
      education: [{ school: "IFRI" }, null, "x"],
    });
    expect(data.firstName).toBe("Aicha");
    expect(data.lastName).toBe("");
    expect(data.education).toHaveLength(1);
    expect(data.education[0].id).toBeTruthy();
  });

  it("only accepts a string photo", () => {
    expect(normalizeData({ photo: 12 }).photo).toBeNull();
    expect(normalizeData({ photo: "data:image/jpeg;base64,AAA" }).photo).toMatch(/^data:/);
  });
  it("keeps a certification and its four-digit year", () => {
    const [cert] = normalizeData({
      certifications: [
        { name: "Python Developer", issuer: "Sololearn", year: "2024", link: "sololearn.com/c/abc" },
      ],
    }).certifications;
    expect(cert).toMatchObject({
      name: "Python Developer",
      issuer: "Sololearn",
      year: "2024",
      link: "sololearn.com/c/abc",
    });
  });
  it("drops a year that is not four plausible digits", () => {
    const years = ["juin 2024", "24", "1850", "20245", ""];
    const out = normalizeData({ certifications: years.map((year) => ({ name: "X", year })) });
    expect(out.certifications.map((c) => c.year)).toEqual(["", "", "", "", ""]);
  });
});

describe("normalizeSettings", () => {
  it("falls back to defaults on bad values", () => {
    expect(normalizeSettings({ region: "mars", cvLang: "de", lang: "xx", step: 99 })).toEqual(
      DEFAULT_SETTINGS,
    );
  });
  it("accepts valid values", () => {
    const s = normalizeSettings({
      region: "international",
      cvLang: "en",
      lang: "en",
      step: 3,
      template: "dev",
    });
    expect(s).toMatchObject({ region: "international", cvLang: "en", lang: "en", step: 3, template: "dev" });
  });
});

describe("storage", () => {
  it("round-trips through storage", () => {
    const storage = fakeStorage();
    const data = normalizeData({ firstName: "Aicha" });
    expect(saveState(data, DEFAULT_SETTINGS, storage)).toBe(true);
    expect(loadState(storage).data.firstName).toBe("Aicha");
  });
  it("returns null when empty or corrupted", () => {
    expect(loadState(fakeStorage())).toBeNull();
    expect(loadState(fakeStorage({ [STORAGE_KEY]: "{broken" }))).toBeNull();
  });
  it("reports failure when the storage throws", () => {
    const storage = {
      setItem: () => {
        throw new Error("full");
      },
    };
    expect(saveState(EMPTY_DATA, DEFAULT_SETTINGS, storage)).toBe(false);
  });
});

describe("export and import", () => {
  it("round-trips", () => {
    const data = normalizeData({ firstName: "Aicha", skills: [{ name: "React" }] });
    const back = importJson(exportJson(data, DEFAULT_SETTINGS));
    expect(back.data.firstName).toBe("Aicha");
    expect(back.data.skills[0].name).toBe("React");
  });
  it("rejects other files", () => {
    expect(() => importJson('{"hello":1}')).toThrow();
    expect(() => importJson("not json")).toThrow();
  });
});

describe("pdfFileName", () => {
  it("builds CV_Prenom_Nom without accents or spaces", () => {
    expect(pdfFileName({ firstName: "Aïcha Marie", lastName: "DOSSOU" })).toBe("CV_Aicha-Marie_DOSSOU");
  });
  it("falls back to CV when empty", () => {
    expect(pdfFileName({ firstName: "", lastName: "" })).toBe("CV");
  });
});

describe("strict import", () => {
  const file = (data, extra = {}) =>
    JSON.stringify({ app: "cvgen", version: 2, data, settings: {}, ...extra });

  it("rejects a remote photo URL", () => {
    expect(() => importJson(file({ photo: "https://exemple.com/x.jpg" }))).toThrow();
  });
  it("rejects non-jpeg data URLs", () => {
    expect(() => importJson(file({ photo: "data:image/svg+xml;base64,AAAA" }))).toThrow();
    expect(() => importJson(file({ photo: "javascript:alert(1)" }))).toThrow();
  });
  it("rejects an oversized photo", () => {
    const big = "data:image/jpeg;base64," + "A".repeat(LIMITS.photoChars);
    expect(() => importJson(file({ photo: big }))).toThrow();
  });
  it("accepts a normal jpeg photo", () => {
    const photo = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
    expect(importJson(file({ photo })).data.photo).toBe(photo);
  });
  it("rejects wrong types and unknown versions", () => {
    expect(() => importJson(file({ firstName: 42 }))).toThrow();
    expect(() => importJson(file({ skills: "React" }))).toThrow();
    expect(() => importJson(file({ skills: ["React"] }))).toThrow();
    expect(() => importJson(file({ languages: [{ name: "Français", level: 9 }] }))).toThrow();
    expect(() => importJson(file({}, { version: 1 }))).toThrow();
    expect(() => importJson(file(null))).toThrow();
  });
  it("rejects too long texts and too many items", () => {
    expect(() => importJson(file({ firstName: "a".repeat(LIMITS.shortText + 1) }))).toThrow();
    expect(() => importJson(file({ summary: "a".repeat(LIMITS.longText + 1) }))).toThrow();
    const skills = Array.from({ length: LIMITS.items.skills + 1 }, () => ({ name: "x" }));
    expect(() => importJson(file({ skills }))).toThrow();
  });
  it("rejects a file that is too large", () => {
    expect(() => importJson(" ".repeat(LIMITS.fileBytes + 1))).toThrow();
  });
  it("drops unknown keys and keeps ids unique", () => {
    const skills = [
      { id: "a", name: "React", evil: "x" },
      { id: "a", name: "Laravel" },
    ];
    const out = importJson(file({ skills, extra: "x" })).data;
    expect(out.extra).toBeUndefined();
    expect(out.skills[0].evil).toBeUndefined();
    expect(out.skills[0].id).not.toBe(out.skills[1].id);
  });
  it("keeps the stored draft but sanitizes it", () => {
    const stored = normalizeData({
      photo: "https://exemple.com/x.jpg",
      firstName: "Aïcha",
      skills: [{ name: 5 }],
    });
    expect(stored.photo).toBeNull();
    expect(stored.firstName).toBe("Aïcha");
    expect(stored.skills[0].name).toBe("");
  });
  it("ignores an unknown template id", () => {
    expect(normalizeSettings({ template: "<img src=x>" }).template).toBe(DEFAULT_SETTINGS.template);
  });
});

describe("detectLang", () => {
  it("picks English for an English browser", () => {
    expect(detectLang(["en-US", "en"])).toBe("en");
  });
  it("picks French for a Beninese or French browser", () => {
    expect(detectLang(["fr-BJ", "fr"])).toBe("fr");
  });
  it("uses the first supported language in the list", () => {
    expect(detectLang(["es-ES", "en-GB", "fr"])).toBe("en");
  });
  it("falls back to French", () => {
    expect(detectLang(["es-ES"])).toBe("fr");
    expect(detectLang([])).toBe("fr");
  });
});
