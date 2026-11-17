import { useState } from "react";
import { useI18n } from "../i18n";
import { SITUATIONS, TEMPLATES, recommend, templatesFor } from "../data/templates";
import { Button } from "./ui";
import Icon from "./Icon";
import TemplateThumb from "./TemplateThumb";
import styles from "./TemplatePicker.module.css";

function Guide({ onResult }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState({});
  const questions = [
    { key: "status", q: "guide.q1", options: ["student", "worker", "change"], prefix: "guide.q1." },
    { key: "field", q: "guide.q2", options: ["tech", "creative", "other"], prefix: "guide.q2." },
    { key: "sendMode", q: "guide.q3", options: ["direct", "form"], prefix: "guide.q3." },
  ];
  const done = questions.every((q) => answers[q.key]);
  const result = done ? recommend(answers) : null;
  const current = questions.find((q) => !answers[q.key]);

  return (
    <div className={styles.guide}>
      <div>
        <h2 className={styles.guideTitle}>{t("guide.title")}</h2>
        <p className={styles.muted}>{t("guide.text")}</p>
      </div>
      {!open ? (
        <Button variant="secondary" onClick={() => setOpen(true)}>
          {t("guide.open")}
        </Button>
      ) : (
        <div className={styles.guideBody} aria-live="polite">
          {current && (
            <fieldset className={styles.question}>
              <legend>{t(current.q)}</legend>
              <div className={styles.options}>
                {current.options.map((o) => (
                  <Button
                    key={o}
                    variant="secondary"
                    size="small"
                    onClick={() => setAnswers((a) => ({ ...a, [current.key]: o }))}
                  >
                    {t(`${current.prefix}${o}`)}
                  </Button>
                ))}
              </div>
            </fieldset>
          )}
          {result && (
            <div className={styles.result}>
              <p>
                {t("guide.result")} <strong>{t(`tpl.${result}.name`)}</strong>
              </p>
              <div className={styles.options}>
                <Button variant="accent" size="small" onClick={() => onResult(result)}>
                  {t("models.use")}
                </Button>
                <Button variant="ghost" size="small" onClick={() => setAnswers({})}>
                  {t("guide.restart")}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TemplatePicker({ current, onPick, navigate, hasSaved }) {
  const { t } = useI18n();
  const [situation, setSituation] = useState("all");
  const ids = templatesFor(situation);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} onClick={() => navigate(hasSaved ? "editor" : "home")}>
          <Icon name="back" size={20} />
          {hasSaved ? t("editor.title") : t("nav.backHome")}
        </button>
        <span className={styles.logo}>{t("app.name")}</span>
      </header>
      <main className={styles.main}>
        <p className={styles.eyebrow}>{t("models.eyebrow")}</p>
        <h1 className={styles.title}>{t("models.title")}</h1>
        <p className={styles.lead}>{t("models.text")}</p>

        <div className={styles.filters} role="group" aria-label={t("models.title")}>
          {[...SITUATIONS, "all"].map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={situation === s}
              className={styles.filter}
              onClick={() => setSituation(s)}
            >
              {t(`models.filter.${s}`)}
            </button>
          ))}
        </div>

        {ids.length === 0 ? (
          <p>{t("models.empty")}</p>
        ) : (
          <ul className={styles.grid}>
            {ids.map((id) => {
              const tpl = TEMPLATES[id];
              return (
                <li key={id} className={`${styles.card} ${id === current ? styles.cardCurrent : ""}`}>
                  <div className={styles.thumb}>
                    <TemplateThumb id={id} />
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.tags}>
                      <span className={styles.tag}>
                        <Icon name="columns" size={14} />
                        {t(tpl.layout === "two" ? "models.columns.two" : "models.columns.single")}
                      </span>
                      {tpl.atsSafe ? (
                        <span className={`${styles.tag} ${styles.tagOk}`}>{t("models.ats")}</span>
                      ) : (
                        <span className={`${styles.tag} ${styles.tagWarn}`}>{t("models.direct")}</span>
                      )}
                    </div>
                    <h2 className={styles.cardTitle}>{t(`tpl.${id}.name`)}</h2>
                    <dl className={styles.facts}>
                      <dt>{t("models.who")}</dt>
                      <dd>{t(`tpl.${id}.who`)}</dd>
                      <dt>{t("models.sees")}</dt>
                      <dd>{t(`tpl.${id}.sees`)}</dd>
                      <dt>{t("models.order")}</dt>
                      <dd>{t(`tpl.${id}.order`)}</dd>
                    </dl>
                    {!tpl.atsSafe && <p className={styles.warn}>{t("models.noAts")}</p>}
                    <Button variant={id === current ? "secondary" : "accent"} onClick={() => onPick(id)}>
                      {id === current ? t("models.current") : t("models.use")}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <Guide onResult={onPick} />

        <ul className={styles.notes}>
          {["all", "region", "switch"].map((k) => (
            <li key={k} className={styles.note}>
              <h3>{t(`models.${k}.title`)}</h3>
              <p className={styles.muted}>{t(`models.${k}.text`)}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
