import { describe, expect, it } from "vitest";
import { SITUATIONS, TEMPLATES, TEMPLATE_IDS, getTemplate, recommend, templatesFor } from "../data/templates";
import { LAYOUTS, LAYOUT_IDS, getLayout, layoutIsSafe, splitSections } from "../data/layouts";
import { SAMPLES, SAMPLE_ACCENTS, SAMPLE_LAYOUTS } from "../data/samples";

const KNOWN = ["summary", "education", "certifications", "projects", "experience", "skills", "languages"];

describe("templates", () => {
  it("has the seven models", () => {
    expect(TEMPLATE_IDS).toEqual(["stage", "chrono", "hybride", "dev", "vitrine", "sobre", "atelier"]);
  });
  it("only uses known sections", () => {
    for (const tpl of Object.values(TEMPLATES)) {
      tpl.sections.forEach((s) => expect(KNOWN).toContain(s));
    }
  });
  it("gives every model a real layout", () => {
    for (const tpl of Object.values(TEMPLATES)) {
      expect(LAYOUT_IDS).toContain(tpl.defaultLayout);
    }
  });
  // C'est le reproche d'origine : sept modèles qui partageaient tous la même
  // colonne unique se ressemblaient forcément. Chaque modèle arrive donc
  // dans une géométrie qui lui est propre.
  it("never gives two models the same default layout", () => {
    const used = TEMPLATE_IDS.map((id) => TEMPLATES[id].defaultLayout);
    expect(new Set(used).size).toBe(used.length);
  });
  it("falls back to the first model for unknown ids", () => {
    expect(getTemplate("nope").id).toBe("stage");
  });
  it("offers at least one model per situation", () => {
    SITUATIONS.forEach((s) => expect(templatesFor(s).length).toBeGreaterThan(0));
    expect(templatesFor("all")).toHaveLength(7);
  });
  it("recommends sensibly", () => {
    expect(recommend({ status: "student", field: "other", sendMode: "form" })).toBe("stage");
    expect(recommend({ status: "student", field: "tech", sendMode: "form" })).toBe("dev");
    expect(recommend({ status: "worker", field: "creative", sendMode: "direct" })).toBe("vitrine");
    expect(recommend({ status: "change", field: "other", sendMode: "form" })).toBe("hybride");
    expect(recommend({ status: "worker", field: "other", sendMode: "form" })).toBe("chrono");
  });
});

describe("layouts", () => {
  it("falls back to the plain one for unknown ids", () => {
    expect(getLayout("nope").id).toBe("classique");
  });
  it("marks one-column layouts as the safe ones for tracking systems", () => {
    for (const layout of Object.values(LAYOUTS)) {
      expect(layoutIsSafe(layout)).toBe(layout.col === "single");
    }
  });
  it("keeps every section when splitting into two columns", () => {
    const sections = TEMPLATES.stage.sections;
    for (const layout of Object.values(LAYOUTS)) {
      const { aside, main } = splitSections(sections, layout);
      expect([...main, ...aside].slice().sort()).toEqual(sections.slice().sort());
    }
  });
  it("keeps the order the model asked for inside each column", () => {
    const sections = TEMPLATES.dev.sections;
    const { aside, main } = splitSections(sections, LAYOUTS.colonneGauche);
    expect(main).toEqual(sections.filter((s) => main.includes(s)));
    expect(aside).toEqual(sections.filter((s) => aside.includes(s)));
  });
  it("leaves a one-column layout untouched", () => {
    const sections = TEMPLATES.chrono.sections;
    expect(splitSections(sections, LAYOUTS.classique)).toEqual({ aside: [], main: sections });
  });
  // Une bande de couleur sans contenu serait un défaut de mise en page, donc
  // un modèle qui n'a aucune rubrique courte retombe sur une colonne unique.
  it("never leaves the side column empty", () => {
    const { aside, main } = splitSections(["summary", "experience"], LAYOUTS.colonneSombre);
    expect(aside).toEqual([]);
    expect(main).toEqual(["summary", "experience"]);
  });
});

describe("gallery samples", () => {
  it("has a filled example, a layout and a colour for every model", () => {
    for (const id of TEMPLATE_IDS) {
      expect(SAMPLES[id], id).toBeTruthy();
      expect(LAYOUT_IDS, id).toContain(SAMPLE_LAYOUTS[id]);
      expect(SAMPLE_ACCENTS[id], id).toBeTruthy();
    }
  });
  it("shows a different geometry on every card", () => {
    const used = TEMPLATE_IDS.map((id) => SAMPLE_LAYOUTS[id]);
    expect(new Set(used).size).toBe(used.length);
  });
  it("never shows the same person twice", () => {
    const names = TEMPLATE_IDS.map((id) => `${SAMPLES[id].firstName} ${SAMPLES[id].lastName}`);
    expect(new Set(names).size).toBe(names.length);
  });
  // Les exemples circulent en ligne : aucune adresse ni aucun lien ne doit
  // pointer vers une vraie personne.
  it("keeps every example address on example.com", () => {
    for (const id of TEMPLATE_IDS) {
      const s = SAMPLES[id];
      expect(s.email, id).toMatch(/@example\.com$/);
      for (const value of [s.website, ...s.projects.map((p) => p.link)]) {
        if (value) expect(value, `${id}: ${value}`).toMatch(/example\.com|github\.com|linkedin\.com/);
      }
    }
  });
});
