import { useI18n } from "../i18n";
import Icon from "../components/Icon";
import styles from "./Editor.module.css";

export default function Checks({ checks, pages }) {
  const { t } = useI18n();
  const ok = checks.filter((c) => c.ok).length;
  return (
    <section className={styles.checks} aria-labelledby="checks-title">
      <div className={styles.checksHead}>
        <h2 id="checks-title" className={styles.checksTitle}>
          {t("editor.checks")}
        </h2>
        <p className={styles.mutedSmall}>{t("editor.checksCount", { ok, total: checks.length })}</p>
      </div>
      <ul className={styles.plainList}>
        {checks.map((c) => (
          <li key={c.id} className={`${styles.check} ${c.ok ? styles.checkOk : styles.checkTodo}`}>
            <Icon name={c.ok ? "check" : "warning"} size={18} />
            <span>
              {t(`check.${c.id}`)}
              {c.id === "pages" && !c.ok ? ` (${pages})` : ""}
            </span>
            <span className={styles.visuallyHidden}>{c.ok ? t("check.ok") : t("check.todo")}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
