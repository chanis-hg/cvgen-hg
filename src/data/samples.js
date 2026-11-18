/**
 * One filled CV per template, for the gallery.
 *
 * These are shown at a glance and read at full size, so they do double duty:
 * they let someone see the shape of a finished CV before typing anything, and
 * they are a worked example of how to write one. The wording is deliberately
 * plain and concrete — a student copying the tone of these entries ends up
 * with a better CV than one copying a job board's boilerplate.
 *
 * Every address is on example.com and every number is in the +229 01 97 00 00
 * range reserved here for documentation, so nothing resolves to a real person.
 */

export const SAMPLES = {
  stage: {
    firstName: "Aïcha",
    lastName: "DOSSOU",
    jobTitle: "Étudiante en informatique",
    location: "Abomey-Calavi, Bénin",
    phone: "+229 01 97 00 14 22",
    email: "aicha.dossou@example.com",
    linkedin: "linkedin.com/in/aicha-dossou",
    github: "github.com/aichadossou",
    website: "",
    photo: null,
    summary:
      "Étudiante en deuxième année d'informatique à l'IFRI. Je cherche un stage de trois mois en développement web pour mettre en pratique ce que j'apprends et découvrir le travail en équipe.",
    education: [
      {
        school: "IFRI — Université d'Abomey-Calavi",
        degree: "Licence en informatique",
        startDate: "10/2024",
        endDate: "",
        current: true,
        detail: "Algorithmique, bases de données, développement web.",
      },
      {
        school: "CEG Le Nokoué, Cotonou",
        degree: "Baccalauréat série D",
        startDate: "09/2021",
        endDate: "07/2024",
        current: false,
        detail: "Mention bien.",
      },
    ],
    certifications: [
      { name: "Python Developer", issuer: "Sololearn", year: "2025", link: "" },
      { name: "Les fondamentaux de React", issuer: "LinkedIn Learning", year: "2026", link: "" },
    ],
    experiences: [],
    projects: [
      {
        name: "Kandi",
        stack: "React, Vite",
        link: "github.com/aichadossou/kandi",
        description:
          "Site vitrine pour une couturière du quartier : catalogue de modèles et prise de contact par WhatsApp. Utilisé depuis six mois.",
      },
      {
        name: "Suivi de dépenses",
        stack: "JavaScript, LocalStorage",
        link: "",
        description:
          "Petite application de budget qui fonctionne sans connexion, écrite pour m'exercer aux formulaires et au stockage local.",
      },
    ],
    skills: [
      { name: "HTML" },
      { name: "CSS" },
      { name: "JavaScript" },
      { name: "React" },
      { name: "Python" },
      { name: "Git" },
    ],
    languages: [
      { name: "Français", level: 4 },
      { name: "Fon", level: 4 },
      { name: "Anglais", level: 2 },
    ],
  },

  chrono: {
    firstName: "Raymond",
    lastName: "AGOSSOU",
    jobTitle: "Comptable",
    location: "Cotonou, Bénin",
    phone: "+229 01 97 00 38 07",
    email: "raymond.agossou@example.com",
    linkedin: "linkedin.com/in/raymond-agossou",
    github: "",
    website: "",
    photo: null,
    summary:
      "Huit ans de comptabilité en PME et en cabinet. Je tiens une comptabilité complète du justificatif au bilan, en normes SYSCOHADA, et je forme les équipes aux outils.",
    education: [
      {
        school: "ENEAM — Université d'Abomey-Calavi",
        degree: "Licence en comptabilité et gestion",
        startDate: "10/2014",
        endDate: "07/2017",
        current: false,
        detail: "",
      },
    ],
    certifications: [{ name: "Sage 100 Comptabilité", issuer: "Sage", year: "2021", link: "" }],
    experiences: [
      {
        company: "Cabinet Tchibozo & Associés",
        position: "Comptable principal",
        startDate: "03/2021",
        endDate: "",
        current: true,
        description:
          "Tenue de la comptabilité de onze clients, de la saisie au bilan. Préparation des déclarations fiscales mensuelles. Formation de deux assistants à Sage.",
      },
      {
        company: "Établissements Hounkpatin",
        position: "Comptable",
        startDate: "01/2018",
        endDate: "02/2021",
        current: false,
        description:
          "Comptabilité générale et paie d'une entreprise de trente salariés. Mise en place du suivi des stocks, qui a réduit les écarts d'inventaire.",
      },
      {
        company: "Cabinet Tchibozo & Associés",
        position: "Assistant comptable",
        startDate: "08/2017",
        endDate: "12/2017",
        current: false,
        description: "Saisie des pièces et rapprochements bancaires.",
      },
    ],
    projects: [],
    skills: [
      { name: "SYSCOHADA" },
      { name: "Sage 100" },
      { name: "Excel avancé" },
      { name: "Paie" },
      { name: "Déclarations fiscales" },
    ],
    languages: [
      { name: "Français", level: 4 },
      { name: "Anglais", level: 2 },
    ],
  },

  hybride: {
    firstName: "Nadège",
    lastName: "HOUNKPATIN",
    jobTitle: "Chargée de communication digitale",
    location: "Porto-Novo, Bénin",
    phone: "+229 01 97 00 52 61",
    email: "nadege.hounkpatin@example.com",
    linkedin: "linkedin.com/in/nadege-hounkpatin",
    github: "",
    website: "nadegeh.example.com",
    photo: null,
    summary:
      "Six ans en communication institutionnelle, en reconversion vers le marketing digital. Je rédige, je gère des pages et j'analyse ce que les publications rapportent réellement.",
    education: [
      {
        school: "FLLAC — Université d'Abomey-Calavi",
        degree: "Licence en lettres modernes",
        startDate: "10/2015",
        endDate: "07/2018",
        current: false,
        detail: "",
      },
    ],
    certifications: [
      { name: "Fondamentaux du marketing digital", issuer: "Google", year: "2025", link: "" },
      { name: "Meta Certified Digital Marketing Associate", issuer: "Meta", year: "2026", link: "" },
    ],
    experiences: [
      {
        company: "ONG Sɔ Ayidego",
        position: "Chargée de communication",
        startDate: "09/2019",
        endDate: "",
        current: true,
        description:
          "Rédaction des supports et animation des réseaux. La page Facebook est passée de 2 000 à 18 000 abonnés en trois ans.",
      },
      {
        company: "Mairie de Porto-Novo",
        position: "Assistante de communication",
        startDate: "10/2018",
        endDate: "08/2019",
        current: false,
        description: "Couverture des événements municipaux, rédaction du bulletin trimestriel.",
      },
    ],
    projects: [],
    skills: [
      { name: "Rédaction web" },
      { name: "Meta Business Suite" },
      { name: "Canva" },
      { name: "Google Analytics" },
      { name: "Photographie" },
    ],
    languages: [
      { name: "Français", level: 4 },
      { name: "Anglais", level: 3 },
      { name: "Gun", level: 4 },
    ],
  },

  dev: {
    firstName: "Serge",
    lastName: "ADJOVI",
    jobTitle: "Développeur web",
    location: "Cotonou, Bénin",
    phone: "+229 01 97 00 71 45",
    email: "serge.adjovi@example.com",
    linkedin: "linkedin.com/in/serge-adjovi",
    github: "github.com/sergeadjovi",
    website: "sergeadjovi.example.com",
    photo: null,
    summary:
      "Développeur web, deux ans d'expérience. Je conçois des interfaces légères, pensées pour des connexions lentes et des téléphones d'entrée de gamme.",
    education: [
      {
        school: "IFRI — Université d'Abomey-Calavi",
        degree: "Licence en génie logiciel",
        startDate: "10/2020",
        endDate: "07/2023",
        current: false,
        detail: "",
      },
    ],
    certifications: [{ name: "Responsive Web Design", issuer: "freeCodeCamp", year: "2023", link: "" }],
    experiences: [
      {
        company: "Agence Lumen, Cotonou",
        position: "Développeur front-end",
        startDate: "09/2024",
        endDate: "",
        current: true,
        description:
          "Développement de sites clients en React. J'ai divisé par trois le poids de la page d'accueil du plus gros client, qui se charge maintenant en moins de deux secondes en 3G.",
      },
      {
        company: "Freelance",
        position: "Développeur web",
        startDate: "08/2023",
        endDate: "08/2024",
        current: false,
        description: "Sites vitrines et boutiques pour des commerçants de Cotonou et de Calavi.",
      },
    ],
    projects: [
      {
        name: "Tchiwi",
        stack: "React, Vite, IndexedDB",
        link: "github.com/sergeadjovi/tchiwi",
        description:
          "Carnet de commandes hors connexion pour les petits commerces. Se synchronise quand le réseau revient.",
      },
      {
        name: "Zem",
        stack: "JavaScript, Leaflet",
        link: "github.com/sergeadjovi/zem",
        description: "Calculateur de tarif de zémidjan à partir de la distance réelle du trajet.",
      },
    ],
    skills: [
      { name: "JavaScript" },
      { name: "React" },
      { name: "TypeScript" },
      { name: "Node.js" },
      { name: "PostgreSQL" },
      { name: "Git" },
      { name: "Figma" },
    ],
    languages: [
      { name: "Français", level: 4 },
      { name: "Anglais", level: 3 },
    ],
  },

  vitrine: {
    firstName: "Mélanie",
    lastName: "SOGLO",
    jobTitle: "Designer graphique",
    location: "Cotonou, Bénin",
    phone: "+229 01 97 00 90 13",
    email: "melanie.soglo@example.com",
    linkedin: "linkedin.com/in/melanie-soglo",
    github: "",
    website: "melaniesoglo.example.com",
    photo: null,
    summary:
      "Designer graphique, quatre ans en identité visuelle et édition. Je travaille surtout pour des marques locales qui veulent se tenir debout face aux grandes enseignes.",
    education: [
      {
        school: "IMA — Institut de Multimédia Appliqué",
        degree: "Licence en design graphique",
        startDate: "10/2018",
        endDate: "07/2021",
        current: false,
        detail: "",
      },
    ],
    certifications: [
      { name: "Adobe Certified Professional — Illustrator", issuer: "Adobe", year: "2024", link: "" },
    ],
    experiences: [
      {
        company: "Studio Agbo",
        position: "Designer graphique",
        startDate: "02/2022",
        endDate: "",
        current: true,
        description:
          "Identités visuelles et packagings pour des marques agroalimentaires béninoises. Une quinzaine de chartes livrées.",
      },
      {
        company: "Imprimerie Tundé",
        position: "Infographiste",
        startDate: "09/2021",
        endDate: "01/2022",
        current: false,
        description: "Mise en page et préparation des fichiers pour l'impression offset.",
      },
    ],
    projects: [
      {
        name: "Collection Adjagbo",
        stack: "Illustrator, InDesign",
        link: "",
        description: "Série d'affiches sur les marchés de Cotonou, exposée au Centre culturel en 2025.",
      },
    ],
    skills: [
      { name: "Illustrator" },
      { name: "InDesign" },
      { name: "Photoshop" },
      { name: "Figma" },
      { name: "Typographie" },
      { name: "Identité visuelle" },
    ],
    languages: [
      { name: "Français", level: 4 },
      { name: "Anglais", level: 2 },
      { name: "Fon", level: 3 },
    ],
  },
  sobre: {
    firstName: "Pélagie",
    lastName: "TOSSOU",
    jobTitle: "Gestionnaire comptable",
    location: "Porto-Novo, Bénin",
    phone: "+229 01 95 44 207 18",
    email: "pelagie.tossou@example.com",
    linkedin: "linkedin.com/in/pelagie-tossou",
    github: "",
    website: "",
    photo: null,
    summary:
      "Neuf ans de comptabilité en PME, du journal d'achats à la liasse fiscale. Je cherche un poste de responsable administratif et financier dans une structure en croissance.",
    education: [
      {
        school: "ENEAM — Université d'Abomey-Calavi",
        degree: "Master en gestion financière et comptable",
        startDate: "10/2014",
        endDate: "09/2016",
        current: false,
        detail: "",
      },
      {
        school: "ENEAM — Université d'Abomey-Calavi",
        degree: "Licence en comptabilité et gestion",
        startDate: "10/2011",
        endDate: "07/2014",
        current: false,
        detail: "",
      },
    ],
    certifications: [
      { name: "SYSCOHADA révisé", issuer: "Ordre des experts-comptables", year: "2019", link: "" },
      { name: "Excel avancé", issuer: "LinkedIn Learning", year: "2023", link: "" },
    ],
    experiences: [
      {
        position: "Chef comptable",
        company: "Groupe Sèmè Distribution",
        startDate: "03/2021",
        endDate: "",
        current: true,
        description:
          "Tenue complète de la comptabilité de trois entités.\nClôture mensuelle ramenée de trois semaines à huit jours.\nEncadrement de deux comptables et d'un stagiaire.",
      },
      {
        position: "Comptable",
        company: "Bénin Agro Services",
        startDate: "01/2017",
        endDate: "02/2021",
        current: false,
        description:
          "Déclarations fiscales et sociales mensuelles.\nRapprochements bancaires et suivi des créances clients.",
      },
      {
        position: "Assistante comptable",
        company: "Cabinet Adjakpa & Associés",
        startDate: "10/2016",
        endDate: "12/2016",
        current: false,
        description: "Saisie des pièces et préparation des dossiers de révision.",
      },
    ],
    projects: [],
    skills: [
      { name: "SYSCOHADA" },
      { name: "Sage Comptabilité" },
      { name: "Excel" },
      { name: "Déclarations fiscales" },
      { name: "Paie" },
      { name: "Contrôle interne" },
    ],
    languages: [
      { name: "Français", level: 4 },
      { name: "Anglais", level: 2 },
      { name: "Goun", level: 4 },
    ],
  },
  atelier: {
    firstName: "Kévin",
    lastName: "AHOUANDJINOU",
    jobTitle: "Designer & développeur front-end",
    location: "Cotonou, Bénin",
    phone: "+229 01 96 31 88 05",
    email: "kevin.ahouandjinou@example.com",
    linkedin: "linkedin.com/in/kevin-ahouandjinou",
    github: "github.com/kevinahouandjinou",
    website: "kevin-a.example.com",
    photo: null,
    summary:
      "Je dessine des interfaces et je les code. Quatre ans à travailler avec des commerçants et des associations du Bénin, surtout sur des sites qui doivent rester rapides sur un réseau lent.",
    education: [
      {
        school: "IFRI — Université d'Abomey-Calavi",
        degree: "Licence en informatique",
        startDate: "10/2019",
        endDate: "07/2022",
        current: false,
        detail: "",
      },
    ],
    certifications: [
      { name: "Responsive Web Design", issuer: "freeCodeCamp", year: "2022", link: "" },
      { name: "Figma pour les équipes produit", issuer: "Coursera", year: "2024", link: "" },
    ],
    experiences: [
      {
        position: "Développeur front-end",
        company: "Atelier Zinsou Digital",
        startDate: "06/2023",
        endDate: "",
        current: true,
        description:
          "Sites vitrines et boutiques pour une dizaine de clients locaux.\nPoids des pages divisé par trois en reprenant les images et les polices.\nMaquettes Figma remises directement en code.",
      },
      {
        position: "Designer web indépendant",
        company: "À son compte",
        startDate: "09/2021",
        endDate: "05/2023",
        current: false,
        description:
          "Identité visuelle et site pour des commerçants de Dantokpa.\nFormation des clients à la mise à jour de leur propre contenu.",
      },
    ],
    projects: [
      {
        name: "Tchiwa",
        stack: "React, Vite, Tailwind",
        link: "github.com/kevinahouandjinou/tchiwa",
        description:
          "Carte des marchés de Cotonou avec horaires et prix indicatifs. Fonctionne hors connexion après la première visite.",
      },
      {
        name: "Gbɛ̀",
        stack: "SVG, JavaScript",
        link: "github.com/kevinahouandjinou/gbe",
        description: "Petite bibliothèque de motifs inspirés des tissus béninois, libre d'usage.",
      },
    ],
    skills: [
      { name: "Figma" },
      { name: "React" },
      { name: "CSS" },
      { name: "Accessibilité" },
      { name: "Design système" },
      { name: "Typographie" },
    ],
    languages: [
      { name: "Français", level: 4 },
      { name: "Anglais", level: 3 },
      { name: "Fon", level: 4 },
    ],
  },
};

/**
 * A different accent per sample, so the gallery shows the colour choice
 * existing rather than describing it. These are only the examples' colours;
 * the person picks their own in the editor.
 */
// Chaque exemple de la galerie arrive dans sa propre disposition, pour que
// le défilement montre de vraies géométries différentes et non le même CV
// repeint sept fois.
export const SAMPLE_LAYOUTS = {
  stage: "colonneGauche",
  chrono: "classique",
  hybride: "bandeau",
  dev: "chronologie",
  vitrine: "colonneSombre",
  sobre: "centre",
  atelier: "colonneDroite",
};

export const SAMPLE_TITLE_STYLES = {
  stage: "filet",
  chrono: "nu",
  hybride: "pastille",
  dev: "barre",
  vitrine: "pastille",
  sobre: "filet",
  atelier: "barre",
};

export const SAMPLE_SKILL_STYLES = {
  stage: "pastilles",
  chrono: "ligne",
  hybride: "pastilles",
  dev: "pastilles",
  vitrine: "puces",
  sobre: "ligne",
  atelier: "pastilles",
};

export const SAMPLE_ACCENTS = {
  stage: "navy",
  chrono: "slate",
  hybride: "plum",
  dev: "blue",
  vitrine: "clay",
  sobre: "ink",
  atelier: "copper",
};

/** The sample written for a template, or the student one as a fallback. */
export function sampleFor(templateId) {
  return SAMPLES[templateId] || SAMPLES.stage;
}
