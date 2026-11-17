import { getTemplate } from "../data/templates";
import styles from "./TemplateThumb.module.css";

function Block({ hot, lines = 2 }) {
  return (
    <div className={`${styles.block} ${hot ? styles.hot : ""}`}>
      <span className={styles.blockTitle} />
      {Array.from({ length: lines }, (_, i) => (
        <span key={i} className={styles.line} style={{ width: `${92 - i * 18}%` }} />
      ))}
    </div>
  );
}

const HOT = {
  stage: "education",
  chrono: "experience",
  hybride: "skills",
  dev: "projects",
  vitrine: "experience",
};

export default function TemplateThumb({ id }) {
  const template = getTemplate(id);
  const hot = HOT[id];
  if (template.layout === "two") {
    return (
      <div className={styles.thumb} aria-hidden="true">
        <div className={styles.twoCols}>
          <div className={styles.aside}>
            <span className={styles.avatar} />
            <span className={styles.line} />
            <span className={styles.line} style={{ width: "70%" }} />
            <Block lines={2} />
            <Block lines={1} />
          </div>
          <div className={styles.main}>
            <span className={styles.name} />
            <span className={styles.role} />
            {template.main.map((s) => (
              <Block key={s} hot={s === hot} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.thumb} aria-hidden="true">
      <div className={styles.head}>
        <div>
          <span className={styles.name} />
          <span className={styles.role} />
          {template.showLinksFirst && (
            <span className={`${styles.line} ${styles.hotLine}`} style={{ width: "60%" }} />
          )}
        </div>
        <span className={styles.avatar} />
      </div>
      {template.sections.map((s) => (
        <Block key={s} hot={s === hot} lines={s === "skills" || s === "languages" ? 1 : 2} />
      ))}
    </div>
  );
}
