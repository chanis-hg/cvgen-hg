import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import fr from "../i18n/fr";
import en from "../i18n/en";
import { translate } from "../i18n";

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return name === "test" ? [] : sourceFiles(full);
    return /\.(jsx?|js)$/.test(name) ? [full] : [];
  });
}

describe("dictionaries", () => {
  it("have the same keys in French and English", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(fr).sort());
  });
  it("have no empty values", () => {
    for (const dict of [fr, en]) {
      Object.entries(dict).forEach(([key, value]) => expect(value, key).not.toBe(""));
    }
  });
  it("use the same placeholders in both languages", () => {
    const vars = (s) => (typeof s === "string" ? (s.match(/\{\w+\}/g) || []).sort() : []);
    Object.keys(fr).forEach((key) => expect(vars(en[key]), key).toEqual(vars(fr[key])));
  });
  it("define every key used as a literal in the source", () => {
    const used = new Set();
    for (const file of sourceFiles(join(process.cwd(), "src"))) {
      const text = readFileSync(file, "utf8");
      for (const m of text.matchAll(/\bt\(\s*["'`]([\w.]+)["'`]/g)) used.add(m[1]);
      for (const m of text.matchAll(/\b(?:label|hint|ph|q|addLabel)\s*[:=]\s*["']([a-z]+\.[\w.]+)["']/g))
        used.add(m[1]);
    }
    expect(used.size).toBeGreaterThan(60);
    const missing = [...used].filter((k) => !(k in fr));
    expect(missing).toEqual([]);
  });
  it("define the template texts for every model", () => {
    ["stage", "chrono", "hybride", "dev", "vitrine"].forEach((id) => {
      ["name", "who", "sees", "order"].forEach((part) => expect(fr[`tpl.${id}.${part}`]).toBeTruthy());
    });
  });
});

describe("translate", () => {
  it("interpolates variables", () => {
    expect(translate("fr", "editor.stepOf", { n: 2, total: 6 })).toBe("Étape 2 sur 6");
  });
  it("falls back to the key when unknown", () => {
    expect(translate("fr", "nope.nope")).toBe("nope.nope");
  });
});
