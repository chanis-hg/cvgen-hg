import { useCallback, useEffect, useState } from "react";

const KEY = "wura:theme";

// Tant que personne n'a choisi, on suit le système. Dès qu'on choisit, le
// choix l'emporte et il est conservé : c'est le seul réglage du site qui
// survive à la fermeture de l'onglet, parce qu'un thème qu'il faut
// réarmer à chaque visite n'est pas un thème.
export function readStoredTheme() {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

function systemTheme() {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function useTheme() {
  const [stored, setStored] = useState(readStoredTheme);
  const [system, setSystem] = useState(systemTheme);

  // Quelqu'un qui n'a rien choisi et qui bascule son téléphone en mode
  // sombre le soir doit voir le site suivre, sans recharger.
  useEffect(() => {
    let mq;
    try {
      mq = window.matchMedia("(prefers-color-scheme: dark)");
    } catch {
      return undefined;
    }
    const onChange = (e) => setSystem(e.matches ? "dark" : "light");
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const theme = stored ?? system;

  useEffect(() => {
    const el = document.documentElement;
    if (stored) el.setAttribute("data-theme", stored);
    else el.removeAttribute("data-theme");
    // La barre d'adresse du téléphone prend la couleur du fond, sinon on a
    // un bandeau blanc au-dessus d'une page bleu nuit.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0b0f2e" : "#f6f7fb");
  }, [stored, theme]);

  const toggle = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setStored(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* navigation privée : le thème tient pour la session, c'est tout */
    }
  }, [theme]);

  return { theme, toggle };
}
