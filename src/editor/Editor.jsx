import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "../i18n";
import { getTemplate } from "../data/templates";
import { pdfFileName } from "../data/model";
import { hasCvContent, runChecks, validateIdentity } from "../lib/validate";
import CVSheet from "../components/CVSheet";
import FitPage from "../components/FitPage";
import Icon from "../components/Icon";
import { Button } from "../components/ui";
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
  const ratio = sheet.offsetHeight ? sheetRect.height / sheet.offsetHeight : 1;
  let bottom = 0;
  sheet.querySelectorAll("header, section, p").forEach((el) => {
    bottom = Math.max(bottom, (el.getBoundingClientRect().bottom - sheetRect.top) / ratio);
  });
  return bottom - PAGE_PADDING_PX - 2;
}

export function measurePages(sheet) {
  if (!sheet) return 1;
  return Math.max(1, Math.ceil(measureContent(sheet) / PAGE_CONTENT_PX));
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
  return Math.max(0, Math.min(100, Math.round((measureContent(sheet) / PAGE_CONTENT_PX) * 100)));
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

export default function Editor({ cv, navigate }) {
  const { t, lang } = useI18n();
  const { data, settings, setField, patchSettings, replaceAll, reset, saveStatus } = cv;
  const [tab, setTab] = useState("form");
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
      frame = requestAnimationFrame(() => {
        const sheet = document.querySelector("[data-preview] [data-cv-sheet]");
        setPages(measurePages(sheet));
        setFill(measureFill(sheet));
      });
    };
    run();
    document.fonts?.ready?.then(run);
    return () => cancelAnimationFrame(frame);
    // `tab` matters: on a phone the preview panel is display:none behind the
    // form tab, so the sheet measures zero until the tab is actually shown.
  }, [data, settings.template, settings.region, settings.cvLang, tab]);

  const checks = useMemo(
    () => runChecks(data, { pages, region: settings.region }),
    [data, pages, settings.region],
  );
  const download = () => {
    setDownloadTried(true);
    if (hasCvContent(data)) printCV(data);
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
            pages={pages}
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
          <div className={styles.segment} role="group" aria-label={t("nav.uiLang")}>
            {["fr", "en"].map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={lang === l}
                onClick={() => patchSettings({ lang: l })}
                className={styles.segmentButton}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
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
            <div className={styles.toolbar}>
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
            </div>
            <div className={styles.previewBar}>
              <div className={styles.fill}>
                <span className={styles.fillLabel}>
                  {pages > 1 ? t("editor.fillOver", { pages }) : t("editor.fill", { percent: fill })}
                </span>
                <span className={styles.fillTrack} aria-hidden="true">
                  <span
                    className={styles.fillBar}
                    data-over={pages > 1}
                    style={{ width: `${Math.min(100, fill)}%` }}
                  />
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
                <div key={`${settings.template}-${settings.region}`} className={styles.sheetSwap}>
                  <CVSheet
                    data={data}
                    templateId={settings.template}
                    region={settings.region}
                    cvLang={settings.cvLang}
                  />
                </div>
              </FitPage>
            </div>
            {/* on the last step the same list sits in the left panel, beside
                the sentence that asks the user to act on it */}
            {!isFinish && <Checks checks={checks} pages={pages} />}
          </section>
        </div>
      </main>

      {printRoot &&
        createPortal(
          <CVSheet
            data={data}
            templateId={settings.template}
            region={settings.region}
            cvLang={settings.cvLang}
          />,
          printRoot,
        )}
    </div>
  );
}
