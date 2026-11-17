/**
 * Dates are stored as "MM/YYYY" (or "YYYY" alone when only the year is known).
 * Tracking systems compute the length of an experience from that format, and a
 * student typing freely writes "juillet 25", "2023-2024" or nothing at all, so
 * the editor only ever writes values that come out of these helpers.
 */

export const MIN_YEAR = 1960;
export const FUTURE_YEARS = 6;

const PATTERNS = [
  // 07/2025, 7-2025, 07.2025
  /^(\d{1,2})\s*[/\-.]\s*(\d{4})$/,
  // 2025/07, 2025-07
  /^(\d{4})\s*[/\-.]\s*(\d{1,2})$/,
];

export function parseMonthYear(value) {
  const text = String(value ?? "").trim();
  if (!text) return { month: "", year: "" };

  const yearOnly = text.match(/^(\d{4})$/);
  if (yearOnly) return { month: "", year: yearOnly[1] };

  for (const [index, pattern] of PATTERNS.entries()) {
    const found = text.match(pattern);
    if (!found) continue;
    const [rawMonth, rawYear] = index === 0 ? [found[1], found[2]] : [found[2], found[1]];
    const month = Number(rawMonth);
    if (month < 1 || month > 12) return { month: "", year: "" };
    return { month: String(month).padStart(2, "0"), year: rawYear };
  }
  return { month: "", year: "" };
}

export function formatMonthYear(month, year) {
  if (!year) return "";
  return month ? `${month}/${year}` : year;
}

/** Newest year the editor offers; a certificate dated beyond it is a typo. */
export function latestYear(now = new Date()) {
  return now.getFullYear() + FUTURE_YEARS;
}

export function yearOptions(now = new Date()) {
  const latest = now.getFullYear() + FUTURE_YEARS;
  const years = [];
  for (let year = latest; year >= MIN_YEAR; year -= 1) years.push(String(year));
  return years;
}

/**
 * Rewrites what the selects can read into the canonical form and leaves the
 * rest untouched: an older save holding "juillet 2024" keeps showing that on
 * the CV rather than losing a date behind the user's back.
 */
export function normalizeDate(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  const { month, year } = parseMonthYear(text);
  return year ? formatMonthYear(month, year) : text;
}

/** true when the value is empty or something these fields can round-trip. */
export function isMonthYear(value) {
  const text = String(value ?? "").trim();
  if (!text) return true;
  const { year } = parseMonthYear(text);
  return Boolean(year);
}

/** Months counted from a MM/YYYY pair; null when either end is unusable. */
export function monthsBetween(start, end) {
  const from = parseMonthYear(start);
  const to = parseMonthYear(end);
  if (!from.year || !to.year) return null;
  const months =
    (Number(to.year) - Number(from.year)) * 12 + (Number(to.month || 12) - Number(from.month || 1));
  return months < 0 ? null : months + 1;
}
