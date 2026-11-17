const FR_RULES = [
  [/\bje suis bon(?:ne)? en\b/gi, "je maîtrise"],
  [/\bj'ai fait\b/gi, "j'ai réalisé"],
  [/\bj'ai fais\b/gi, "j'ai réalisé"],
  [/\bj'aime bien\b/gi, "je suis attiré(e) par"],
  [/\bj'aime\b/gi, "je suis passionné(e) par"],
  [/\bje veux\b/gi, "je souhaite"],
  [/\bje cherche\b/gi, "je recherche"],
  [/\bje voudrais\b/gi, "je souhaiterais"],
  [/\btravailler en équipe\b/gi, "collaborer au sein d'une équipe"],
  [/\bbeaucoup de\b/gi, "de nombreux"],
  [/\bplein de\b/gi, "de nombreux"],
  [/\bchoses\b/gi, "éléments"],
  [/\bme débrouiller\b/gi, "faire preuve d'autonomie"],
  [/\bapprendre vite\b/gi, "m'adapter rapidement"],
  [/\bje sais faire\b/gi, "je sais réaliser"],
  [/\baider\b/gi, "contribuer à"],
  [/\bs'occuper de\b/gi, "assurer"],
  [/\bs'est occupé de\b/gi, "a assuré"],
  [/\bm'occuper de\b/gi, "assurer"],
  [/\bm'occupais de\b/gi, "assurais"],
  [/(?<![\p{L}])ça(?![\p{L}])/giu, "cela"],
  [/\bboulot\b/gi, "emploi"],
  [/\bfaire des sites\b/gi, "concevoir des sites web"],
];

const EN_RULES = [
  [/\bi am good at\b/gi, "I am skilled in"],
  [/\bi did\b/gi, "I carried out"],
  [/\bi like\b/gi, "I am passionate about"],
  [/\bi want\b/gi, "I am seeking"],
  [/\bwork in a team\b/gi, "collaborate within a team"],
  [/\ba lot of\b/gi, "numerous"],
  [/\bthings\b/gi, "tasks"],
  [/\blearn fast\b/gi, "adapt quickly"],
  [/\bhelped\b/gi, "contributed to"],
];

const RULES = { fr: FR_RULES, en: EN_RULES };

export function suggestFormulas(text, lang = "fr") {
  const rules = RULES[lang] || FR_RULES;
  const found = [];
  for (const [pattern, replacement] of rules) {
    pattern.lastIndex = 0;
    const match = pattern.exec(text);
    if (match && match[0].toLowerCase() !== replacement.toLowerCase()) {
      found.push({ from: match[0], to: replacement });
    }
  }
  return found;
}

export function applyFormula(text, suggestion) {
  return text.replace(suggestion.from, suggestion.to);
}

const FR_LEVELS = {
  l3: "Étudiant(e) en Licence 3",
  l2: "Étudiant(e) en Licence 2",
  l1: "Étudiant(e) en Licence 1",
  master: "Étudiant(e) en Master",
  graduate: "Jeune diplômé(e)",
  worker: "Professionnel(le)",
};

const EN_LEVELS = {
  l3: "Third-year undergraduate student",
  l2: "Second-year undergraduate student",
  l1: "First-year undergraduate student",
  master: "Master's student",
  graduate: "Recent graduate",
  worker: "Professional",
};

const FR_GOALS = {
  internship: "un stage",
  job: "un premier emploi",
  alternance: "une alternance",
  freelance: "des missions en freelance",
};

const EN_GOALS = {
  internship: "an internship",
  job: "an entry-level job",
  alternance: "a work-study placement",
  freelance: "freelance assignments",
};

export const LEVEL_KEYS = Object.keys(FR_LEVELS);
export const GOAL_KEYS = Object.keys(FR_GOALS);

export function buildSummaries({ level, field, goal, domain, strength }, lang = "fr") {
  const fr = lang !== "en";
  const levels = fr ? FR_LEVELS : EN_LEVELS;
  const goals = fr ? FR_GOALS : EN_GOALS;
  const who = levels[level] || levels.l3;
  const wants = goals[goal] || goals.internship;
  const f = field.trim();
  const d = domain.trim();
  const s = strength.trim();

  if (fr) {
    const base = f ? `${who} en ${f}` : who;
    const target = d ? `à la recherche de ${wants} en ${d}` : `à la recherche de ${wants}`;
    const asset = s ? ` Je mets à votre service ${s}.` : "";
    return [
      `${base}, ${target}.${asset}`,
      `${base} motivé(e) et rigoureux(se), je recherche ${wants}${d ? ` dans le domaine ${d}` : ""} afin de mettre en pratique mes acquis.${asset}`,
      `${base}. Je souhaite rejoindre une équipe${d ? ` ${d}` : ""} pour ${wants.replace(/^un |^une |^des /, "")} et contribuer concrètement aux projets.${asset}`,
    ].map(tidy);
  }
  const base = f ? `${who} in ${f}` : who;
  const target = d ? `looking for ${wants} in ${d}` : `looking for ${wants}`;
  const asset = s ? ` I bring ${s}.` : "";
  return [
    `${base}, ${target}.${asset}`,
    `${base}, motivated and rigorous, seeking ${wants}${d ? ` in ${d}` : ""} to apply what I have learned.${asset}`,
    `${base}. I want to join a team${d ? ` in ${d}` : ""} and contribute to real projects.${asset}`,
  ].map(tidy);
}

function tidy(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/\s+([.,])/g, "$1")
    .trim();
}
