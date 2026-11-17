import { useState } from "react";
import { useI18n } from "../i18n";
import { applyMatch, checkGrammar } from "../lib/languagetool";
import { Button } from "../components/ui";
import Icon from "../components/Icon";
import styles from "./Editor.module.css";

const ERROR_KEYS = { rate_limit: "assist.grammarRate", too_long: "assist.grammarLong" };

export default function GrammarCheck({ text, textLang, onApply }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ status: "idle", matches: [], error: "" });

  const run = async () => {
    setState({ status: "busy", matches: [], error: "" });
    try {
      const matches = await checkGrammar(text, textLang);
      setState({ status: "done", matches, error: "" });
    } catch (e) {
      setState({ status: "error", matches: [], error: t(ERROR_KEYS[e.message] || "assist.grammarFail") });
    }
  };

  const apply = (match, replacement) => {
    onApply(applyMatch(text, match, replacement));
    setState({ status: "idle", matches: [], error: "" });
  };

  return (
    <div className={styles.assistant}>
      <Button variant="ghost" size="small" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="info" size={18} />
        {t("assist.grammar")}
      </Button>
      {open && (
        <div className={styles.card}>
          <p className={styles.notice}>
            <Icon name="lock" size={18} />
            <span>
              {t("assist.grammarWarn")} {t("assist.grammarBy")}{" "}
              <a href="https://languagetool.org" target="_blank" rel="noreferrer">
                languagetool.org
              </a>
              .
            </span>
          </p>
          <div className={styles.actions}>
            <Button variant="accent" onClick={run} disabled={state.status === "busy" || !text.trim()}>
              {state.status === "busy" ? t("assist.grammarBusy") : t("assist.grammarRun")}
            </Button>
          </div>
          <div aria-live="polite">
            {state.status === "error" && <p className={styles.errorText}>{state.error}</p>}
            {state.status === "done" && state.matches.length === 0 && (
              <p className={styles.mutedSmall}>{t("assist.grammarNone")}</p>
            )}
            {state.status === "done" && state.matches.length > 0 && (
              <ul className={styles.plainList}>
                {state.matches.map((m, i) => (
                  <li key={i} className={styles.hintRow}>
                    <span>
                      <strong>{text.slice(m.offset, m.offset + m.length)}</strong> : {m.message}
                    </span>
                    <span className={styles.itemButtons}>
                      {m.replacements.map((r) => (
                        <Button key={r} variant="secondary" size="small" onClick={() => apply(m, r)}>
                          {r}
                        </Button>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
