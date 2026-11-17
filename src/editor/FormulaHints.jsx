import { useMemo } from "react";
import { useI18n } from "../i18n";
import { applyFormula, suggestFormulas } from "../lib/phrases";
import { Button } from "../components/ui";
import styles from "./Editor.module.css";

export default function FormulaHints({ text, lang, onApply }) {
  const { t } = useI18n();
  const suggestions = useMemo(() => suggestFormulas(text, lang), [text, lang]);
  if (suggestions.length === 0) return null;
  return (
    <div className={styles.hints} aria-live="polite">
      <p className={styles.hintsTitle}>{t("assist.formulas")}</p>
      <p className={styles.mutedSmall}>{t("assist.formulasText")}</p>
      <ul className={styles.plainList}>
        {suggestions.map((s) => (
          <li key={s.from} className={styles.hintRow}>
            <span>
              <s>{s.from}</s> &rarr; <strong>{s.to}</strong>
            </span>
            <Button variant="secondary" size="small" onClick={() => onApply(applyFormula(text, s))}>
              {t("assist.replace")}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
