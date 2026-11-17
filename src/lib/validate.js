const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URL_LIKE = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i;

export const isEmail = (v) => EMAIL.test(v.trim());

export function isPhone(v) {
  const digits = v.replace(/[\s().-]/g, "");
  return /^\+?\d{8,15}$/.test(digits);
}

export function isUrl(v) {
  return URL_LIKE.test(v.trim());
}

export function toHref(v) {
  const value = v.trim();
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function displayUrl(v) {
  return v
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");
}

export function validateIdentity(data) {
  const errors = {};
  if (!data.firstName.trim()) errors.firstName = "required";
  if (!data.lastName.trim()) errors.lastName = "required";
  if (!data.jobTitle.trim()) errors.jobTitle = "required";
  if (!data.email.trim()) errors.email = "required";
  else if (!isEmail(data.email)) errors.email = "invalid";
  if (data.phone.trim() && !isPhone(data.phone)) errors.phone = "invalid";
  for (const key of ["linkedin", "github", "website"]) {
    if (data[key].trim() && !isUrl(data[key])) errors[key] = "invalid";
  }
  return errors;
}

/**
 * Recruiters and tracking systems both reward a result over a task description
 * ("corrigé 20 anomalies" beats "correction d'anomalies"), and a beginner
 * rarely thinks of it on their own. Any digit counts: a quantity, a duration,
 * a number of people.
 */
export function hasFigures(data) {
  return [...data.experiences, ...data.projects].some((item) => /\d/.test(item.description || ""));
}

export function runChecks(data, { pages = 1, region = "benin" } = {}) {
  const summaryLength = data.summary.trim().length;
  const described = [...data.experiences, ...data.projects].some((item) => (item.description || "").trim());
  const checks = [
    { id: "name", ok: Boolean(data.firstName.trim() && data.lastName.trim()) },
    { id: "title", ok: Boolean(data.jobTitle.trim()) },
    { id: "email", ok: isEmail(data.email) },
    { id: "phone", ok: isPhone(data.phone) },
    { id: "summary", ok: summaryLength >= 60 && summaryLength <= 400 },
    { id: "education", ok: data.education.length > 0 },
    { id: "experience", ok: data.experiences.length + data.projects.length > 0 },
    { id: "skills", ok: data.skills.length >= 3 },
    { id: "pages", ok: pages <= 1 },
  ];
  // only worth raising once something is actually described
  if (described) checks.push({ id: "figures", ok: hasFigures(data) });
  if (region === "benin") checks.push({ id: "photo", ok: Boolean(data.photo) });
  return checks;
}

export function hasCvContent(data) {
  const hasName = Boolean(data.firstName.trim() || data.lastName.trim());
  const hasText = Boolean(data.jobTitle.trim() || data.summary.trim());
  const hasItems =
    data.education.length + data.experiences.length + data.projects.length + data.skills.length > 0;
  return hasName && (hasText || hasItems);
}
