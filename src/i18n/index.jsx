import { createContext, useCallback, useContext, useMemo } from "react";
import fr from "./fr";
import en from "./en";

export const DICTIONARIES = { fr, en };

export function translate(lang, key, vars) {
  const dict = DICTIONARIES[lang] || fr;
  const value = dict[key] ?? fr[key] ?? key;
  if (typeof value !== "string" || !vars) return value;
  return value.replace(/\{(\w+)\}/g, (_, name) => (name in vars ? String(vars[name]) : `{${name}}`));
}

const I18nContext = createContext({ lang: "fr", t: (key) => key });

export function I18nProvider({ lang, children }) {
  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);
  const value = useMemo(() => ({ lang, t }), [lang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
