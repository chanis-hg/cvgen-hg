export const TEMPLATES = {
  stage: {
    id: "stage",
    layout: "single",
    situations: ["student"],
    sections: ["summary", "education", "projects", "experience", "skills", "languages"],
    atsSafe: true,
  },
  chrono: {
    id: "chrono",
    layout: "single",
    situations: ["experienced"],
    sections: ["summary", "experience", "education", "skills", "languages"],
    atsSafe: true,
  },
  hybride: {
    id: "hybride",
    layout: "single",
    situations: ["change"],
    sections: ["skills", "summary", "experience", "education", "languages"],
    atsSafe: true,
  },
  dev: {
    id: "dev",
    layout: "single",
    situations: ["dev", "student"],
    sections: ["summary", "skills", "projects", "experience", "education", "languages"],
    atsSafe: true,
    showLinksFirst: true,
  },
  vitrine: {
    id: "vitrine",
    layout: "two",
    situations: ["creative"],
    aside: ["skills", "languages"],
    main: ["summary", "experience", "education", "projects"],
    atsSafe: false,
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
