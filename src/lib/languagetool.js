export const LT_ENDPOINT = "https://api.languagetool.org/v2/check";
export const LT_MAX_CHARS = 20000;

export async function checkGrammar(text, lang = "fr", fetchImpl = globalThis.fetch) {
  if (!text.trim()) return [];
  if (text.length > LT_MAX_CHARS) throw new Error("too_long");
  const body = new URLSearchParams({ text, language: lang === "en" ? "en-US" : "fr" });
  const response = await fetchImpl(LT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body,
  });
  if (response.status === 429) throw new Error("rate_limit");
  if (!response.ok) throw new Error("failed");
  const json = await response.json();
  return (json.matches || []).slice(0, 20).map((m) => ({
    message: m.message,
    offset: m.offset,
    length: m.length,
    replacements: (m.replacements || []).slice(0, 3).map((r) => r.value),
  }));
}

export function applyMatch(text, match, replacement) {
  return text.slice(0, match.offset) + replacement + text.slice(match.offset + match.length);
}
