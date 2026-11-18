import { useMemo, useState } from "react";
import { useI18n } from "../i18n";
import { SITUATIONS, TEMPLATES, recommend, templatesFor } from "../data/templates";
import { normalizeData } from "../data/model";
import { getLayout, layoutIsSafe } from "../data/layouts";
import ThemeToggle from "./ThemeToggle";
import {
  SAMPLE_ACCENTS,
  SAMPLE_LAYOUTS,
  SAMPLE_SKILL_STYLES,
  SAMPLE_TITLE_STYLES,
  sampleFor,
} from "../data/samples";
import { Button, Modal } from "./ui";
import Icon from "./Icon";
import SheetPreview from "./SheetPreview";
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

function Tags({ tpl, t }) {
  const layout = getLayout(tpl.defaultLayout);
  return (
    <div className={styles.tags}>
      <span className={styles.tag}>
        <Icon name="columns" size={14} />
        {t(`layout.${layout.id}`)}
      </span>
      {layoutIsSafe(layout) ? (
        <span className={`${styles.tag} ${styles.tagOk}`}>{t("models.ats")}</span>
      ) : (
        <span className={`${styles.tag} ${styles.tagWarn}`}>{t("models.direct")}</span>
      )}
    </div>
  );
}

export default function TemplatePicker({
  current,
  onPick,
  onUseSample,
  navigate,
  hasSaved,
  region = "benin",
  cvLang = "fr",
  theme,
  onToggleTheme,
}) {
  const { t } = useI18n();
  const [situation, setSituation] = useState("all");
  const [openId, setOpenId] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const ids = templatesFor(situation);

  // Normalised once: the sheet expects a complete shape, and every item needs
  // the id the renderer keys on.
  const samples = useMemo(() => {
    const out = {};
    Object.keys(TEMPLATES).forEach((id) => {
      out[id] = normalizeData(sampleFor(id));
    });
    return out;
  }, []);

  const close = () => {
    setOpenId(null);
    setConfirming(false);
  };

  const startFromSample = (id) => {
    if (hasSaved && !confirming) {
      setConfirming(true);
      return;
    }
    onUseSample(id, samples[id]);
  };

  const openTpl = openId ? TEMPLATES[openId] : null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} onClick={() => navigate(hasSaved ? "editor" : "home")}>
          <Icon name="back" size={20} />
          {hasSaved ? t("editor.title") : t("nav.backHome")}
        </button>
        <div className={styles.headerRight}>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <span className={styles.logo}>{t("app.name")}</span>
        </div>
      </header>
      <main className={styles.main}>
        <p className={styles.eyebrow}>{t("models.eyebrow")}</p>
        <h1 className={styles.title}>{t("models.title")}</h1>
        <p className={styles.lead}>{t("models.lead")}</p>

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
          <ul className={styles.grid} aria-label={t("models.gridLabel")}>
            {ids.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  className={`${styles.card} ${id === current ? styles.cardCurrent : ""}`}
                  onClick={() => setOpenId(id)}
                >
                  <span className={styles.preview}>
                    <SheetPreview
                      data={samples[id]}
                      templateId={id}
                      region={region}
                      cvLang={cvLang}
                      accent={SAMPLE_ACCENTS[id]}
                      layout={SAMPLE_LAYOUTS[id]}
                      titleStyle={SAMPLE_TITLE_STYLES[id]}
                      skillStyle={SAMPLE_SKILL_STYLES[id]}
                    />
                  </span>
                  <span className={styles.cardBody}>
                    <span className={styles.cardTitle}>{t(`tpl.${id}.name`)}</span>
                    <span className={styles.cardWho}>{t(`tpl.${id}.who`)}</span>
                    {id === current && <span className={styles.badge}>{t("models.current")}</span>}
                  </span>
                </button>
              </li>
            ))}
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

      <Modal open={openId !== null} onClose={close} label={openId ? t(`tpl.${openId}.name`) : ""}>
        {openTpl && (
          <div className={styles.sheetWrap}>
            <div className={styles.sheetHead}>
              <h2 className={styles.sheetTitle}>{t(`tpl.${openId}.name`)}</h2>
              <button type="button" className={styles.close} onClick={close}>
                <Icon name="close" size={18} />
                <span className={styles.srOnly}>{t("models.close")}</span>
              </button>
            </div>
            <div className={styles.sheetBody}>
              <div className={styles.sheetPage}>
                <SheetPreview
                  data={samples[openId]}
                  templateId={openId}
                  region={region}
                  cvLang={cvLang}
                  accent={SAMPLE_ACCENTS[openId]}
                  layout={SAMPLE_LAYOUTS[openId]}
                  titleStyle={SAMPLE_TITLE_STYLES[openId]}
                  skillStyle={SAMPLE_SKILL_STYLES[openId]}
                />
              </div>
              <div className={styles.sheetSide}>
                <Tags tpl={openTpl} t={t} />
                <dl className={styles.facts}>
                  <dt>{t("models.who")}</dt>
                  <dd>{t(`tpl.${openId}.who`)}</dd>
                  <dt>{t("models.sees")}</dt>
                  <dd>{t(`tpl.${openId}.sees`)}</dd>
                  <dt>{t("models.order")}</dt>
                  <dd>{t(`tpl.${openId}.order`)}</dd>
                </dl>
                {!layoutIsSafe(getLayout(openTpl.defaultLayout)) && (
                  <p className={styles.warn}>{t("models.noAts")}</p>
                )}
                <p className={styles.sampleNote}>{t("models.sampleNote")}</p>
                {confirming ? (
                  <div className={styles.confirm} role="alert">
                    <p>{t("models.replaceWarn")}</p>
                    <div className={styles.options}>
                      <Button variant="danger" onClick={() => startFromSample(openId)}>
                        {t("models.replaceYes")}
                      </Button>
                      <Button variant="ghost" onClick={() => setConfirming(false)}>
                        {t("models.cancel")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.actions}>
                    <Button variant="accent" onClick={() => startFromSample(openId)}>
                      {t("models.startFrom")}
                    </Button>
                    <Button variant="secondary" onClick={() => onPick(openId)}>
                      {t("models.useEmpty")}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
