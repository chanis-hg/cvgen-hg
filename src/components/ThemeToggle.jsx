import { useI18n } from "../i18n";
import styles from "./ThemeToggle.module.css";

// Le soleil et la lune glissent au lieu d'apparaître : on voit lequel part
// et lequel arrive, donc on comprend que c'est un interrupteur à deux états
// et non un bouton qui ouvre un menu.
export default function ThemeToggle({ theme, onToggle, className = "" }) {
  const { t } = useI18n();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`${styles.toggle} ${className}`}
      aria-pressed={dark}
      title={t(dark ? "theme.toLight" : "theme.toDark")}
    >
      <span className={styles.track} aria-hidden="true">
        <span className={styles.knob}>
          <svg viewBox="0 0 24 24" className={styles.icon} fill="none" strokeWidth="2">
            {dark ? (
              <path
                d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"
                stroke="currentColor"
                strokeLinejoin="round"
              />
            ) : (
              <>
                <circle cx="12" cy="12" r="4.2" stroke="currentColor" />
                <path
                  d="M12 2.6v2.2M12 19.2v2.2M21.4 12h-2.2M4.8 12H2.6M18.6 5.4l-1.6 1.6M7 17l-1.6 1.6M18.6 18.6 17 17M7 7 5.4 5.4"
                  stroke="currentColor"
                  strokeLinecap="round"
                />
              </>
            )}
          </svg>
        </span>
      </span>
      <span className={styles.srOnly}>{t(dark ? "theme.toLight" : "theme.toDark")}</span>
    </button>
  );
}
