// La disposition est un axe indépendant du modèle. Un modèle décide de
// l'ordre des rubriques et du vocabulaire ; une disposition décide de la
// géométrie de la page. Les deux se combinent librement, ce qui donne
// autant de rendus que de paires, au lieu de cinq modèles qui se
// ressemblent parce qu'ils partagent tous la même colonne unique.
//
// col     : "single" une colonne, "two" une colonne latérale + le corps
// side    : de quel côté tombe la colonne latérale
// tone    : "light" lavis de la couleur, "dark" aplat plein
// header  : "left" titre aligné à gauche, "band" bandeau pleine largeur,
//           "center" titre centré
// rail    : rail vertical avec pastilles devant les entrées datées
// inkHeavy: la disposition repose sur un aplat imprimé
export const LAYOUTS = {
  classique: { id: "classique", col: "single", header: "left" },
  centre: { id: "centre", col: "single", header: "center" },
  bandeau: { id: "bandeau", col: "single", header: "band", inkHeavy: true },
  chronologie: { id: "chronologie", col: "single", header: "left", rail: true },
  bandeauPhoto: { id: "bandeauPhoto", col: "single", header: "bandPhoto", inkHeavy: true },
  colonneGauche: { id: "colonneGauche", col: "two", side: "left", tone: "light", header: "left" },
  colonneSombre: {
    id: "colonneSombre",
    col: "two",
    side: "left",
    tone: "dark",
    header: "left",
    inkHeavy: true,
  },
  colonneDroite: { id: "colonneDroite", col: "two", side: "right", tone: "light", header: "left" },
};

export const LAYOUT_IDS = Object.keys(LAYOUTS);

// Les rubriques courtes et énumératives tiennent dans une colonne étroite.
// Tout le reste — ce qui a des paragraphes et des dates — reste dans le
// corps, où il garde la place de respirer.
const ASIDE_PREFERRED = ["skills", "languages", "certifications"];

export function getLayout(id) {
  return LAYOUTS[id] || LAYOUTS.classique;
}

// Un modèle donne une liste de rubriques dans son ordre. Pour une
// disposition à deux colonnes, on répartit cette liste sans la réordonner :
// l'ordre voulu par le modèle survit au changement de géométrie.
export function splitSections(sections, layout) {
  if (layout.col !== "two") return { aside: [], main: sections };
  const aside = sections.filter((s) => ASIDE_PREFERRED.includes(s));
  const main = sections.filter((s) => !ASIDE_PREFERRED.includes(s));
  // Une colonne latérale vide ferait une bande de couleur sans contenu.
  if (!aside.length) return { aside: [], main: sections };
  return { aside, main };
}

// Les systèmes de suivi lisent le texte dans l'ordre du flux. Une colonne
// unique est toujours sûre ; deux colonnes restent lisibles ici parce que
// la colonne latérale est émise avant le corps, mais le classement est
// plus fragile, donc on le signale.
export function layoutIsSafe(layout) {
  return layout.col === "single";
}
