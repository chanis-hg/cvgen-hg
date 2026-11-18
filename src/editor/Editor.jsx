import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "../i18n";
import { getTemplate } from "../data/templates";
import { ACCENTS, ACCENT_IDS, DENSITY_IDS, SKILL_STYLES, TITLE_STYLES, pdfFileName } from "../data/model";
import { hasCvContent, missingImportant, runChecks, stepForCheck, validateIdentity } from "../lib/validate";
import CVSheet from "../components/CVSheet";
import LayoutPicker from "../components/LayoutPicker";
import ThemeToggle from "../components/ThemeToggle";
import FitPage from "../components/FitPage";
import Icon from "../components/Icon";
import { Button, Modal } from "../components/ui";
import Checks from "./Checks";
import InAppNotice from "./InAppNotice";
import { EducationStep, ExperienceStep, FinishStep, IdentityStep, ProfileStep, SkillsStep } from "./Steps";
import styles from "./Editor.module.css";

const STEP_KEYS = ["identity", "profile", "education", "experience", "skills", "finish"];
const PAGE_CONTENT_PX = 1017;
const PAGE_PADDING_PX = 53;

/** Height of the content, in CSS pixels, inside an unscaled A4 sheet. */
function measureContent(sheet) {
  const sheetRect = sheet.getBoundingClientRect();
  // Une feuille qui n'est pas affichée — l'onglet Formulaire sur téléphone,
  // ou le tout premier rendu — n'a aucune boîte à mesurer. Sans ce
  // garde-fou, (0 - 0) / 0 vaut NaN, et NaN traverse Math.max, Math.min et
  // Math.round sans jamais être arrêté : « Page remplie à NaN % »
  // s'affichait à l'écran.
  if (!sheetRect.height || !sheet.offsetHeight) return 0;
  const ratio = sheetRect.height / sheet.offsetHeight;
  let bottom = 0;
  sheet.querySelectorAll("header, section, p").forEach((el) => {
    bottom = Math.max(bottom, (el.getBoundingClientRect().bottom - sheetRect.top) / ratio);
  });
  return bottom - PAGE_PADDING_PX - 2;
}

export function measurePages(sheet) {
  if (!sheet) return 1;
  const n = Math.ceil(measureContent(sheet) / PAGE_CONTENT_PX);
  return Number.isFinite(n) ? Math.max(1, n) : 1;
}

/**
 * How much of the first page the CV fills, as a percentage.
 *
 * The preview shows a whole A4 sheet even for a four-line CV, so two thirds of
 * the panel sat blank at exactly the moment the user needs encouraging. The
 * measurement that already counts pages turns that emptiness into a number.
 */
export function measureFill(sheet) {
  if (!sheet) return 0;
  const pct = Math.round((measureContent(sheet) / PAGE_CONTENT_PX) * 100);
  return Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : 0;
}

const SAVE_TEXTS = { saving: "editor.saving", saved: "editor.saved", error: "editor.notSaved" };

export function printCV(data) {
  const previous = document.title;
  document.title = pdfFileName(data);
  const restore = () => {
    document.title = previous;
    window.removeEventListener("afterprint", restore);
  };
  window.addEventListener("afterprint", restore);
  window.print();
}

export default function Editor({ cv, navigate, theme, onToggleTheme }) {
  const { t } = useI18n();
  const { data, settings, setField, patchSettings, replaceAll, reset, saveStatus } = cv;
  const [tab, setTab] = useState("form");
  // Sur téléphone l'aperçu passe en premier et les réglages se replient :
  // quelqu'un qui tape sur « Aperçu » vient voir son CV, pas le configurer.
  // Sur ordinateur il y a la place pour les deux, donc rien ne se replie.
  const [toolsOpen, setToolsOpen] = useState(false);
  const [zoom, setZoom] = useState("fit");
  const [showErrors, setShowErrors] = useState(false);
  const [pages, setPages] = useState(1);
  const [fill, setFill] = useState(0);
  const [downloadTried, setDownloadTried] = useState(false);
  const step = settings.step;
  const isFinish = STEP_KEYS[step] === "finish";
  const template = getTemplate(settings.template);
  const textLang = settings.cvLang;

  const goStep = (n) => patchSettings({ step: Math.max(0, Math.min(STEP_KEYS.length - 1, n)) });

  const next = () => {
    if (step === 0 && Object.keys(validateIdentity(data)).length > 0) {
      setShowErrors(true);
      setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus(), 0);
      return;
    }
    goStep(step + 1);
    document.getElementById("form-panel")?.scrollTo?.({ top: 0 });
  };

  useEffect(() => {
    let frame = 0;
    const run = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const sheet = document.querySelector("[data-preview] [data-cv-sheet]");
        setPages(measurePages(sheet));
        setFill(measureFill(sheet));
      });
    };
    run();
    document.fonts?.ready?.then(run);

    // Au moment où l'onglet Aperçu s'affiche sur téléphone, la feuille n'a
    // pas encore sa taille définitive : une seule mesure tombe sur zéro et
    // y reste. L'observateur remesure dès que le panneau prend ses
    // dimensions, ce qui couvre aussi la rotation de l'écran et le
    // redimensionnement d'une fenêtre.
    let observer;
    const panel = document.querySelector("[data-preview]");
    if (panel && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(run);
      observer.observe(panel);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
    // La disposition, le style des titres, le rendu des compétences et la
    // densité changent tous la hauteur du contenu : sans eux dans cette
    // liste, le nombre de pages affiché reste celui d'avant le changement.
  }, [
    data,
    settings.template,
    settings.region,
    settings.cvLang,
    settings.layout,
    settings.titleStyle,
    settings.skillStyle,
    settings.density,
    tab,
  ]);

  const checks = useMemo(() => runChecks(data, { region: settings.region }), [data, settings.region]);
  // Un CV auquel il manque l'essentiel part quand même si la personne
  // insiste : c'est son CV, pas le nôtre. Mais elle doit l'avoir su avant
  // de l'envoyer à un recruteur, pas après.
  const [missing, setMissing] = useState(null);

  const download = () => {
    setDownloadTried(true);
    if (!hasCvContent(data)) return;
    const gaps = missingImportant(checks);
    if (gaps.length > 0) {
      setMissing(gaps);
      return;
    }
    printCV(data);
  };

  const downloadAnyway = () => {
    setMissing(null);
    printCV(data);
  };

  const fixFirstGap = () => {
    const first = missing?.[0];
    setMissing(null);
    if (first) goStep(stepForCheck(first.id));
  };
  const showEmptyError = downloadTried && !hasCvContent(data);
  const printRoot = document.getElementById("print-root");

  const stepContent = () => {
    switch (STEP_KEYS[step]) {
      case "identity":
        return (
          <IdentityStep data={data} setField={setField} region={settings.region} showErrors={showErrors} />
        );
      case "profile":
        return <ProfileStep data={data} setField={setField} textLang={textLang} />;
      case "education":
        return <EducationStep data={data} setField={setField} textLang={textLang} />;
      case "experience":
        return <ExperienceStep data={data} setField={setField} textLang={textLang} />;
      case "skills":
        return <SkillsStep data={data} setField={setField} textLang={textLang} />;
      default:
        return (
          <FinishStep
            data={data}
            settings={settings}
            checks={checks}
            onImport={replaceAll}
            onReset={reset}
            onDownload={download}
            onGoToStep={goStep}
          />
        );
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.back}
          onClick={() => navigate("home")}
          /* the brand is the visible text, so it has to lead the name */
          aria-label={`${t("app.name")} — ${t("nav.backHome")}`}
        >
          <Icon name="back" size={20} />
          <span className={styles.brand}>{t("app.name")}</span>
        </button>
        <div className={styles.headerRight}>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          {/* The interface language lives in the footer now. Two language
              controls on one screen — this one and "Langue du CV" below —
              meant different things and read as a contradiction. */}
          <Button variant="accent" onClick={download} className={styles.headerDownload}>
            <Icon name="download" size={18} />
            {t("editor.download")}
          </Button>
        </div>
      </header>

      {showEmptyError && (
        <p className={styles.emptyError} role="alert">
          {t("editor.emptyError")}
        </p>
      )}

      <InAppNotice />

      <main className={styles.main}>
        <div className={styles.tabs} role="tablist">
          {[
            ["form", t("editor.tabForm")],
            ["preview", t("editor.tabPreview")],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={styles.tab}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={styles.grid} data-tab={tab}>
          <section id="form-panel" className={styles.left} aria-label={t("editor.tabForm")}>
            <nav aria-label={t("editor.title")}>
              <ol className={styles.stepper}>
                {STEP_KEYS.map((key, i) => (
                  <li key={key}>
                    <button
                      type="button"
                      className={styles.stepButton}
                      aria-current={i === step ? "step" : undefined}
                      data-done={i < step}
                      onClick={() => goStep(i)}
                      title={t(`step.${key}`)}
                    >
                      <span className={styles.stepNumber}>
                        {i < step ? <Icon name="check" size={14} /> : i + 1}
                      </span>
                      {/* Six labels never fitted a 430 px rail without
                          dropping to 10 px, and the step name is already the
                          heading below. Kept in the accessible name and in the
                          tooltip rather than shrunk to the edge of legibility. */}
                      <span className={styles.visuallyHidden}>
                        {t(`step.${key}`)} — {t("editor.stepOf", { n: i + 1, total: STEP_KEYS.length })}
                        {i < step ? `, ${t("check.ok")}` : ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
            {/* keyed on the step so the panel re-enters on every move */}
            <div key={step} className={styles.stepBody}>
              <p className={styles.stepCount}>
                {t("editor.stepOf", { n: step + 1, total: STEP_KEYS.length })}
              </p>
              <h1 className={styles.stepTitle}>{t(`step.${STEP_KEYS[step]}`)}</h1>
              {stepContent()}
            </div>
            <div className={styles.nav}>
              {step > 0 ? (
                <Button variant="secondary" onClick={() => goStep(step - 1)}>
                  <Icon name="back" size={18} />
                  {t("editor.prev")}
                </Button>
              ) : (
                <span />
              )}
              {step < STEP_KEYS.length - 1 && (
                <Button variant="primary" onClick={next}>
                  {t("editor.next")}
                  <Icon name="arrow" size={18} />
                </Button>
              )}
            </div>
            <p
              className={`${styles.saveState} ${saveStatus === "error" ? styles.saveError : ""}`}
              data-status={saveStatus}
              role="status"
            >
              {saveStatus !== "idle" && (
                <>
                  <span className={styles.saveDot} aria-hidden="true" />
                  {t(SAVE_TEXTS[saveStatus])}
                </>
              )}
            </p>
          </section>

          <section className={styles.right} aria-label={t("editor.preview")}>
            <button
              type="button"
              className={styles.toolsToggle}
              aria-expanded={toolsOpen}
              aria-controls="cv-toolbar"
              onClick={() => setToolsOpen((v) => !v)}
            >
              <Icon name="edit" size={18} />
              {t("editor.customise")}
              <Icon name={toolsOpen ? "up" : "down"} size={16} />
            </button>
            <div id="cv-toolbar" className={`${styles.toolbar} ${toolsOpen ? styles.toolbarOpen : ""}`}>
              <div className={styles.toolbarGroup}>
                <span className={styles.toolbarLabel}>{t("editor.model")}</span>
                <strong>{t(`tpl.${template.id}.name`)}</strong>
                <Button variant="secondary" size="small" onClick={() => navigate("models")}>
                  {t("editor.changeModel")}
                </Button>
              </div>
              <div className={styles.toolbarGroup}>
                <span className={styles.toolbarLabel}>{t("editor.region")}</span>
                <div className={styles.segment} role="group" aria-label={t("editor.region")}>
                  {["benin", "international"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      aria-pressed={settings.region === r}
                      onClick={() => patchSettings({ region: r })}
                      className={styles.segmentButton}
                    >
                      {t(`editor.region.${r}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.toolbarGroup}>
                <span className={styles.toolbarLabel}>{t("editor.cvLang")}</span>
                <div className={styles.segment} role="group" aria-label={t("editor.cvLang")}>
                  {[
                    ["fr", "Français"],
                    ["en", "English"],
                  ].map(([code, label]) => (
                    <button
                      key={code}
                      type="button"
                      aria-pressed={settings.cvLang === code}
                      onClick={() => patchSettings({ cvLang: code })}
                      className={styles.segmentButton}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.toolbarGroup}>
                <span className={styles.toolbarLabel}>{t("editor.layout")}</span>
                <LayoutPicker
                  value={settings.layout}
                  onChange={(id) => patchSettings({ layout: id })}
                  accentColor={ACCENTS[settings.accent]}
                />
              </div>
              <div className={styles.toolbarGroup}>
                <span className={styles.toolbarLabel}>{t("editor.accent")}</span>
                <div className={styles.swatches} role="group" aria-label={t("editor.accent")}>
                  {ACCENT_IDS.map((id) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={settings.accent === id}
                      onClick={() => patchSettings({ accent: id })}
                      className={styles.swatch}
                      style={{ "--sw": ACCENTS[id] }}
                      title={t(`editor.accent.${id}`)}
                    >
                      <span className={styles.srOnly}>{t(`editor.accent.${id}`)}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.toolbarGroup}>
                <span className={styles.toolbarLabel}>{t("editor.titleStyle")}</span>
                <div className={styles.segment} role="group" aria-label={t("editor.titleStyle")}>
                  {TITLE_STYLES.map((id) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={settings.titleStyle === id}
                      onClick={() => patchSettings({ titleStyle: id })}
                      className={styles.segmentButton}
                    >
                      {t(`editor.titleStyle.${id}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.toolbarGroup}>
                <span className={styles.toolbarLabel}>{t("editor.skillStyle")}</span>
                <div className={styles.segment} role="group" aria-label={t("editor.skillStyle")}>
                  {SKILL_STYLES.map((id) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={settings.skillStyle === id}
                      onClick={() => patchSettings({ skillStyle: id })}
                      className={styles.segmentButton}
                    >
                      {t(`editor.skillStyle.${id}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.toolbarGroup}>
                <span className={styles.toolbarLabel}>{t("editor.density")}</span>
                <div className={styles.segment} role="group" aria-label={t("editor.density")}>
                  {DENSITY_IDS.map((id) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={settings.density === id}
                      onClick={() => patchSettings({ density: id })}
                      className={styles.segmentButton}
                    >
                      {t(`editor.density.${id}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.previewBar}>
              <div className={styles.fill}>
                <span className={styles.fillLabel}>
                  {pages > 1 ? t("editor.fillOver", { pages }) : t("editor.fill", { percent: fill })}
                </span>
                <span className={styles.fillTrack} aria-hidden="true">
                  <span className={styles.fillBar} style={{ width: `${Math.min(100, fill)}%` }} />
                </span>
              </div>
              <Button
                className={styles.zoomButton}
                variant="secondary"
                size="small"
                aria-pressed={zoom === "full"}
                onClick={() => setZoom((z) => (z === "fit" ? "full" : "fit"))}
              >
                <Icon name={zoom === "fit" ? "zoomIn" : "zoomOut"} size={18} />
                {t(zoom === "fit" ? "editor.zoomIn" : "editor.zoomOut")}
              </Button>
            </div>
            <div className={styles.sheetWrap} data-preview>
              <FitPage zoom={zoom}>
                <div
                  key={`${settings.template}-${settings.region}-${settings.accent}-${settings.density}-${settings.layout}-${settings.titleStyle}-${settings.skillStyle}`}
                  className={styles.sheetSwap}
                >
                  <CVSheet
                    data={data}
                    templateId={settings.template}
                    region={settings.region}
                    cvLang={settings.cvLang}
                    accent={settings.accent}
                    density={settings.density}
                    layout={settings.layout}
                    titleStyle={settings.titleStyle}
                    skillStyle={settings.skillStyle}
                    titleStyle={settings.titleStyle}
                    skillStyle={settings.skillStyle}
                  />
                </div>
              </FitPage>
            </div>
            {/* on the last step the same list sits in the left panel, beside
                the sentence that asks the user to act on it */}
            {!isFinish && <Checks checks={checks} />}
          </section>
        </div>
      </main>

      <Modal open={Boolean(missing)} onClose={() => setMissing(null)} label={t("gate.title")}>
        <div className={styles.gateBody}>
          <h2 className={styles.gateTitle}>{t("gate.title")}</h2>
          <p className={styles.gateText}>{t("gate.text")}</p>
          <ul className={styles.gateList}>
            {(missing ?? []).map((c) => (
              <li key={c.id}>{t(`check.${c.id}`)}</li>
            ))}
          </ul>
          <p className={styles.gateAsk}>{t("gate.ask")}</p>
          <div className={styles.gateActions}>
            <Button variant="accent" onClick={fixFirstGap}>
              {t("gate.fix")}
            </Button>
            <Button variant="ghost" onClick={downloadAnyway}>
              {t("gate.anyway")}
            </Button>
          </div>
        </div>
      </Modal>
      {printRoot &&
        createPortal(
          <CVSheet
            data={data}
            templateId={settings.template}
            region={settings.region}
            cvLang={settings.cvLang}
            accent={settings.accent}
            density={settings.density}
            layout={settings.layout}
            titleStyle={settings.titleStyle}
            skillStyle={settings.skillStyle}
          />,
          printRoot,
        )}
    </div>
  );
}
