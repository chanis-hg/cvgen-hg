import { useI18n } from "../i18n";
import { kindOf } from "../lib/validate";
import Icon from "../components/Icon";
import styles from "./Editor.module.css";

// Les contrôles qui énoncent une règle sans dire pourquoi. Un point qu'on
// ne comprend pas ne se corrige pas : on explique, et seulement quand il
// n'est pas validé — une fois réglé, l'explication n'a plus d'objet.
const EXPLAINED = new Set(["figures", "summary", "skills"]);

export default function Checks({ checks }) {
  const { t } = useI18n();
  const fixes = checks.filter((c) => kindOf(c.id) === "fix");
  const tips = checks.filter((c) => kindOf(c.id) === "tip");
  const ok = fixes.filter((c) => c.ok).length;
  return (
    <section className={styles.checks} aria-labelledby="checks-title">
      <div className={styles.checksHead}>
        <h2 id="checks-title" className={styles.checksTitle}>
          {t("editor.checks")}
        </h2>
        <p className={styles.mutedSmall}>{t("editor.checksCount", { ok, total: fixes.length })}</p>
      </div>
      <ul className={styles.plainList}>
        {fixes.map((c) => (
          <li key={c.id} className={`${styles.check} ${c.ok ? styles.checkOk : styles.checkTodo}`}>
            <Icon name={c.ok ? "check" : "warning"} size={18} />
            <div className={styles.checkText}>
              <span>{t(`check.${c.id}`)}</span>
              {!c.ok && EXPLAINED.has(c.id) && <p className={styles.checkHow}>{t(`check.${c.id}.how`)}</p>}
            </div>
            <span className={styles.visuallyHidden}>{c.ok ? t("check.ok") : t("check.todo")}</span>
          </li>
        ))}
      </ul>

      {tips.length > 0 && (
        <>
          <h3 className={styles.tipsTitle}>{t("editor.tips")}</h3>
          <ul className={styles.plainList}>
            {tips.map((c) => (
              <li key={c.id} className={`${styles.check} ${styles.checkTip}`}>
                {/* Jamais de triangle ici : un conseil que l'outil ne sait
                    pas vérifier ne peut pas être présenté comme un défaut. */}
                <Icon name={c.ok ? "check" : "info"} size={18} />
                <div className={styles.checkText}>
                  <span>{t(`check.${c.id}`)}</span>
                  {!c.ok && EXPLAINED.has(c.id) && (
                    <p className={styles.checkHow}>{t(`check.${c.id}.how`)}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
