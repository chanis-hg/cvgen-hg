export const STORAGE_KEY = "cvgen:v2";
import { TEMPLATE_IDS } from "./templates";
import { LAYOUT_IDS } from "./layouts";
import { MIN_YEAR, latestYear, normalizeDate } from "../lib/dates";

let counter = 0;
export const newId = () => `${Date.now().toString(36)}${(counter++).toString(36)}`;

export const EMPTY_DATA = {
  firstName: "",
  lastName: "",
  jobTitle: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  website: "",
  photo: null,
  birthDate: "",
  birthPlace: "",
  nationality: "",
  maritalStatus: "",
  summary: "",
  education: [],
  certifications: [],
  experiences: [],
  projects: [],
  skills: [],
  languages: [],
};

/**
 * Accents a CV can be printed in.
 *
 * Every one of these clears 5.4:1 against white, so a recruiter reading the
 * PDF on a phone in daylight can read a section title whichever the person
 * picked. "ink" is the no-colour option: the sheet falls back to the body
 * colour and prints as plain black.
 */
export const ACCENTS = {
  ink: "#14130f",
  navy: "#1d3c78",
  blue: "#2456c7",
  slate: "#3d4a5c",
  wine: "#8c2f39",
  clay: "#a8502a",
  plum: "#6b3a7a",
  copper: "#8a5a18",
};
export const ACCENT_IDS = Object.keys(ACCENTS);

/**
 * How tight the sheet is set.
 *
 * This is the one control that trades space against legibility, so it is the
 * person's to make: "ample" reads better and runs longer, "compact" fits more
 * on a page. The multiplier scales every size on the sheet at once, which
 * keeps the proportions the templates were drawn with.
 */
export const DENSITIES = { compact: 0.92, normal: 1, ample: 1.09 };
export const DENSITY_IDS = Object.keys(DENSITIES);

// Le style des titres fait plus pour la personnalité d'un CV que la
// disposition elle-même : à géométrie identique, une pastille arrondie et
// un filet sobre ne racontent pas la même chose.
export const TITLE_STYLES = ["filet", "pastille", "barre", "nu"];

// Les compétences en puces arrondies se lisent mieux qu'une longue ligne
// séparée par des points, mais la ligne reste la plus sûre à l'extraction.
export const SKILL_STYLES = ["ligne", "puces", "pastilles"];

export const DEFAULT_SETTINGS = {
  template: "stage",
  region: "benin",
  cvLang: "fr",
  lang: "fr",
  accent: "navy",
  density: "normal",
  layout: "classique",
  titleStyle: "filet",
  skillStyle: "ligne",
  step: 0,
};

export function detectLang(languages = globalThis.navigator?.languages ?? []) {
  for (const code of languages) {
    const base = String(code).toLowerCase().slice(0, 2);
    if (base === "fr" || base === "en") return base;
  }
  return "fr";
}

export function defaultSettings() {
  const lang = detectLang();
  return { ...DEFAULT_SETTINGS, lang, cvLang: lang };
}

export const LIMITS = {
  fileBytes: 1_500_000,
  photoChars: 300_000,
  shortText: 200,
  longText: 2000,
  items: {
    education: 15,
    certifications: 30,
    experiences: 30,
    projects: 30,
    skills: 60,
    languages: 12,
  },
};

const PHOTO_PATTERN = /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/;

const ITEM_SHAPES = {
  education: {
    school: "text",
    degree: "text",
    startDate: "date",
    endDate: "date",
    current: "flag",
    detail: "long",
  },
  // A certificate carries a year, not a month: Sololearn and LinkedIn Learning
  // date theirs by year alone, and asking for a month would invent precision.
  certifications: { name: "text", issuer: "text", year: "year", link: "text" },
  experiences: {
    company: "text",
    position: "text",
    startDate: "date",
    endDate: "date",
    current: "flag",
    description: "long",
  },
  projects: { name: "text", stack: "text", link: "text", description: "long" },
  skills: { name: "text" },
  languages: { name: "text", level: "level" },
};

const LIST_KEYS = Object.keys(ITEM_SHAPES);

function fail() {
  throw new Error("invalid");
}

function readText(value, max, strict) {
  if (value === undefined) return "";
  if (typeof value !== "string") return strict ? fail() : "";
  if (value.length > max) return strict ? fail() : value.slice(0, max);
  return value;
}

function readPhoto(value, strict) {
  if (value === undefined || value === null) return null;
  const valid = typeof value === "string" && value.length <= LIMITS.photoChars && PHOTO_PATTERN.test(value);
  if (valid) return value;
  return strict ? fail() : null;
}

function readField(kind, value, strict) {
  if (kind === "flag") {
    if (value !== undefined && typeof value !== "boolean" && strict) fail();
    return value === true;
  }
  if (kind === "level") {
    const valid = Number.isInteger(value) && value >= 0 && value <= 3;
    if (!valid && value !== undefined && strict) fail();
    return valid ? value : 2;
  }
  if (kind === "date") return normalizeDate(readText(value, LIMITS.shortText, strict));
  if (kind === "year") {
    const text = readText(value, LIMITS.shortText, strict).trim();
    if (!text) return "";
    const valid = /^\d{4}$/.test(text) && Number(text) >= MIN_YEAR && Number(text) <= latestYear();
    if (!valid) return strict ? fail() : "";
    return text;
  }
  return readText(value, kind === "long" ? LIMITS.longText : LIMITS.shortText, strict);
}

function readList(key, value, strict) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) return strict ? fail() : [];
  const max = LIMITS.items[key];
  if (value.length > max && strict) fail();
  const seen = new Set();
  const items = [];
  for (const raw of value.slice(0, max)) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      if (strict) fail();
      continue;
    }
    const validId = typeof raw.id === "string" && /^[\w-]{1,40}$/.test(raw.id) && !seen.has(raw.id);
    const item = { id: validId ? raw.id : newId() };
    seen.add(item.id);
    for (const [field, kind] of Object.entries(ITEM_SHAPES[key])) {
      item[field] = readField(kind, raw[field], strict);
    }
    items.push(item);
  }
  return items;
}

function sanitizeData(raw, strict) {
  const data = { ...EMPTY_DATA };
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return strict ? fail() : data;
  for (const key of Object.keys(EMPTY_DATA)) {
    if (LIST_KEYS.includes(key)) data[key] = readList(key, raw[key], strict);
    else if (key === "photo") data.photo = readPhoto(raw.photo, strict);
    else data[key] = readText(raw[key], key === "summary" ? LIMITS.longText : LIMITS.shortText, strict);
  }
  return data;
}

export function normalizeData(raw) {
  return sanitizeData(raw, false);
}

export function normalizeSettings(raw) {
  const s = { ...DEFAULT_SETTINGS };
  if (!raw || typeof raw !== "object") return s;
  if (TEMPLATE_IDS.includes(raw.template)) s.template = raw.template;
  if (raw.region === "benin" || raw.region === "international") s.region = raw.region;
  if (raw.cvLang === "fr" || raw.cvLang === "en") s.cvLang = raw.cvLang;
  if (raw.lang === "fr" || raw.lang === "en") s.lang = raw.lang;
  if (ACCENT_IDS.includes(raw.accent)) s.accent = raw.accent;
  if (DENSITY_IDS.includes(raw.density)) s.density = raw.density;
  if (LAYOUT_IDS.includes(raw.layout)) s.layout = raw.layout;
  if (TITLE_STYLES.includes(raw.titleStyle)) s.titleStyle = raw.titleStyle;
  if (SKILL_STYLES.includes(raw.skillStyle)) s.skillStyle = raw.skillStyle;
  if (Number.isInteger(raw.step) && raw.step >= 0 && raw.step <= 5) s.step = raw.step;
  return s;
}

export function loadState(storage = globalThis.localStorage) {
  try {
    const raw = JSON.parse(storage.getItem(STORAGE_KEY));
    if (!raw) return null;
    return {
      data: normalizeData(raw.data),
      settings: normalizeSettings(raw.settings),
    };
  } catch {
    return null;
  }
}

export function saveState(data, settings, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ data, settings }));
    return true;
  } catch {
    return false;
  }
}

export function clearState(storage = globalThis.localStorage) {
  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function exportJson(data, settings) {
  return JSON.stringify({ app: "cvgen", version: 2, data, settings }, null, 2);
}

export function importJson(text) {
  if (typeof text !== "string" || text.length > LIMITS.fileBytes) fail();
  const raw = JSON.parse(text);
  if (!raw || raw.app !== "cvgen" || raw.version !== 2) fail();
  return { data: sanitizeData(raw.data, true), settings: normalizeSettings(raw.settings) };
}

export function pdfFileName(data) {
  const clean = (v) =>
    v
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  const parts = [clean(data.firstName), clean(data.lastName)].filter(Boolean);
  return ["CV", ...parts].join("_");
}
