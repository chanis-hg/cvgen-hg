// Un modèle décide de l'ordre des rubriques, du vocabulaire des titres et
// de la disposition par laquelle il se présente. La disposition reste un
// réglage libre : le modèle n'en donne que le point de départ. C'est ce qui
// évite cinq modèles qui se ressemblent parce qu'ils partageaient tous la
// même colonne unique.
export const TEMPLATES = {
  stage: {
    id: "stage",
    defaultLayout: "colonneGauche",
    situations: ["student"],
    sections: ["summary", "education", "certifications", "projects", "experience", "skills", "languages"],
  },
  chrono: {
    id: "chrono",
    defaultLayout: "classique",
    situations: ["experienced"],
    sections: ["summary", "experience", "education", "certifications", "skills", "languages"],
  },
  hybride: {
    id: "hybride",
    defaultLayout: "bandeau",
    situations: ["change"],
    sections: ["skills", "summary", "experience", "education", "certifications", "languages"],
  },
  dev: {
    id: "dev",
    defaultLayout: "chronologie",
    situations: ["dev", "student"],
    sections: ["summary", "skills", "projects", "experience", "education", "certifications", "languages"],
    showLinksFirst: true,
  },
  vitrine: {
    id: "vitrine",
    defaultLayout: "colonneSombre",
    situations: ["creative"],
    sections: ["summary", "experience", "projects", "education", "certifications", "skills", "languages"],
  },
  sobre: {
    id: "sobre",
    defaultLayout: "centre",
    situations: ["experienced", "change"],
    sections: ["summary", "experience", "education", "certifications", "skills", "languages"],
  },
  atelier: {
    id: "atelier",
    defaultLayout: "colonneDroite",
    situations: ["creative", "dev"],
    sections: ["summary", "projects", "experience", "education", "certifications", "skills", "languages"],
  },
};

export const TEMPLATE_IDS = Object.keys(TEMPLATES);

export const SITUATIONS = ["student", "experienced", "change", "dev", "creative"];

export function getTemplate(id) {
  return TEMPLATES[id] || TEMPLATES.stage;
}

export function templatesFor(situation) {
  if (situation === "all") return TEMPLATE_IDS;
  return TEMPLATE_IDS.filter((id) => TEMPLATES[id].situations.includes(situation));
}

export function recommend({ status, field, sendMode }) {
  if (sendMode === "direct" && field === "creative") return "vitrine";
  if (field === "tech") return "dev";
  if (status === "student") return "stage";
  if (status === "change") return "hybride";
  return "chrono";
}
