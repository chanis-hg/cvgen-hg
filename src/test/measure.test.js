import { describe, expect, it } from "vitest";
import { measureFill, measurePages } from "../editor/Editor";

// Une fausse feuille : on contrôle exactement ce que le navigateur
// répondrait, y compris les cas où il ne répond rien.
function sheet({ rectHeight, offsetHeight, children = [] }) {
  return {
    offsetHeight,
    getBoundingClientRect: () => ({ height: rectHeight, top: 0, bottom: rectHeight }),
    querySelectorAll: () => children.map((bottom) => ({ getBoundingClientRect: () => ({ bottom }) })),
  };
}

describe("measuring the sheet", () => {
  it("reads a normal sheet", () => {
    const s = sheet({ rectHeight: 1123, offsetHeight: 1123, children: [600] });
    expect(measurePages(s)).toBe(1);
    expect(measureFill(s)).toBeGreaterThan(40);
    expect(measureFill(s)).toBeLessThan(60);
  });

  it("counts a second page once the content runs past the first", () => {
    const s = sheet({ rectHeight: 1123, offsetHeight: 1123, children: [1600] });
    expect(measurePages(s)).toBe(2);
  });

  // C'est le bug qui s'affichait à l'écran : sur l'onglet Formulaire d'un
  // téléphone la feuille est masquée, toutes ses mesures valent zéro, et
  // (0 - 0) / 0 donne NaN. NaN traverse Math.max, Math.min et Math.round
  // sans être arrêté, et « Page remplie à NaN % » arrivait jusqu'à l'œil.
  it("never returns NaN when the sheet has no box to measure", () => {
    const hidden = sheet({ rectHeight: 0, offsetHeight: 0, children: [0] });
    expect(measureFill(hidden)).toBe(0);
    expect(measurePages(hidden)).toBe(1);
    expect(Number.isNaN(measureFill(hidden))).toBe(false);
  });

  it("holds up when the sheet is laid out but not yet painted", () => {
    const unpainted = sheet({ rectHeight: 0, offsetHeight: 1123, children: [0] });
    expect(measureFill(unpainted)).toBe(0);
    expect(measurePages(unpainted)).toBe(1);
  });

  it("answers for a sheet that is not there at all", () => {
    expect(measureFill(null)).toBe(0);
    expect(measurePages(null)).toBe(1);
  });

  // L'aperçu est réduit pour tenir dans son panneau : la mesure doit rendre
  // la taille réelle du document, pas celle de sa vignette.
  it("undoes the preview's scaling", () => {
    const full = sheet({ rectHeight: 1123, offsetHeight: 1123, children: [800] });
    const shrunk = sheet({ rectHeight: 561.5, offsetHeight: 1123, children: [400] });
    expect(measureFill(shrunk)).toBe(measureFill(full));
  });

  it("never reports more than a full page", () => {
    const overflowing = sheet({ rectHeight: 1123, offsetHeight: 1123, children: [9000] });
    expect(measureFill(overflowing)).toBe(100);
  });
});
