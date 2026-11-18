import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n";
import ThemeToggle from "./ThemeToggle";
import { AUTHOR, PORTFOLIO_URL, WHATSAPP_URL } from "../lib/config";
import { Button, LinkButton } from "./ui";
import Icon from "./Icon";
import SheetPreview from "./SheetPreview";
import Mark from "./Mark";
import { normalizeData } from "../data/model";
import {
  SAMPLE_ACCENTS,
  SAMPLE_LAYOUTS,
  SAMPLE_SKILL_STYLES,
  SAMPLE_TITLE_STYLES,
  sampleFor,
} from "../data/samples";
import styles from "./Landing.module.css";

function LangToggle({ lang, onChange, label }) {
  return (
    <div className={styles.segment} role="group" aria-label={label}>
      {["fr", "en"].map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => onChange(l)}
          className={styles.segmentButton}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

// Un témoin d'un pixel en haut de page. Quand il sort du champ, la barre
// n'est plus sur le héros sombre : elle reprend un fond opaque. Un
// observateur plutôt qu'un écouteur de défilement, donc rien ne tourne à
// chaque pixel parcouru.
function useLeftTheHero() {
  const ref = useRef(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, stuck];
}

export default function Landing({ navigate, lang, onLang, hasSaved, theme, onToggleTheme }) {
  const { t } = useI18n();
  const cta = hasSaved ? t("nav.continue") : t("nav.create");
  const start = () => navigate(hasSaved ? "editor" : "models");
  const [sentinel, stuck] = useLeftTheHero();

  return (
    <div className={styles.page}>
      <a href="#contenu" className={styles.skip}>
        {t("nav.skip")}
      </a>
      <span ref={sentinel} className={styles.sentinel} aria-hidden="true" />
      <header className={styles.header} data-stuck={stuck ? "true" : "false"}>
        <span className={styles.logo}>
          <Mark size={26} className={styles.logoMark} />
          <span className={styles.logoText}>{t("app.name")}</span>
        </span>
        <nav className={styles.headerNav} aria-label={t("nav.main")}>
          <button type="button" className={styles.navLink} onClick={() => navigate("models")}>
            {t("nav.modelsShort")}
          </button>
        </nav>
        <div className={styles.headerRight}>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <Button variant="accent" onClick={start} className={styles.headerCta}>
            {cta}
          </Button>
        </div>
      </header>

      <main id="contenu">
        <div className={styles.heroBand}>
          <span className={styles.glow} aria-hidden="true" />
          <section className={styles.hero}>
            <div className={styles.heroText}>
              <p className={styles.eyebrowPill}>{t("hero.eyebrow")}</p>
              <h1 className={styles.heroTitle}>
                {t("hero.title1")}
                <br />
                <span className={styles.accentText}>{t("hero.title2")}</span>
              </h1>
              <p className={styles.lead}>{t("hero.sub")}</p>
              <div className={styles.heroActions}>
                <Button variant="accent" onClick={start}>
                  {cta}
                  <Icon name="arrow" size={18} />
                </Button>
                <Button variant="secondary" onClick={() => navigate("models")}>
                  {t("nav.example")}
                </Button>
              </div>
            </div>
            <div className={styles.sampleWrap + " " + styles.heroSheetCrop}>
              {/* the real sheet, not a hand-coded lookalike: the most
                persuasive thing on the page is the thing being sold */}
              <div className={styles.heroSheet}>
                <SheetPreview
                  data={normalizeData(sampleFor("stage"))}
                  templateId="stage"
                  region="benin"
                  cvLang="fr"
                  accent={SAMPLE_ACCENTS.stage}
                  layout={SAMPLE_LAYOUTS.stage}
                  titleStyle={SAMPLE_TITLE_STYLES.stage}
                  skillStyle={SAMPLE_SKILL_STYLES.stage}
                />
              </div>
              <p className={styles.sampleCheck}>
                <Icon name="check" size={18} />
                {t("sample.check")}
              </p>
              <p className={styles.sampleTag}>{t("hero.sample")}</p>
            </div>
          </section>
        </div>

        <div className={styles.bandWhite}>
          <section className={styles.section}>
            <p className={styles.eyebrow}>{t("how.eyebrow")}</p>
            <h2 className={styles.h2}>{t("how.title")}</h2>
            <ol className={styles.steps}>
              {[1, 2, 3].map((n) => (
                <li key={n} className={styles.step}>
                  <span className={styles.stepNumber}>{n}</span>
                  <h3 className={styles.h3}>{t(`how.${n}.title`)}</h3>
                  <p className={styles.muted}>{t(`how.${n}.text`)}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section className={styles.section}>
          <p className={styles.eyebrow}>{t("landingModels.eyebrow")}</p>
          <h2 className={styles.h2}>{t("landingModels.title")}</h2>
          <p className={styles.lead}>{t("landingModels.text")}</p>
          <ul className={styles.shelf}>
            {/* trois géométries franchement différentes : colonne sombre,
                rail chronologique, titre centré */}
            {["vitrine", "dev", "sobre"].map((id) => (
              <li key={id} className={styles.shelfItem}>
                <div className={styles.thumbBox}>
                  <SheetPreview
                    data={normalizeData(sampleFor(id))}
                    templateId={id}
                    region="benin"
                    cvLang="fr"
                    accent={SAMPLE_ACCENTS[id]}
                    layout={SAMPLE_LAYOUTS[id]}
                    titleStyle={SAMPLE_TITLE_STYLES[id]}
                    skillStyle={SAMPLE_SKILL_STYLES[id]}
                  />
                </div>
                <h3 className={styles.shelfName}>{t(`tpl.${id}.name`)}</h3>
              </li>
            ))}
          </ul>
          <Button variant="secondary" onClick={() => navigate("models")}>
            {t("nav.models")}
          </Button>
        </section>

        <div className={styles.bandSoft}>
          <section className={styles.section}>
            <p className={styles.eyebrow}>{t("benin.eyebrow")}</p>
            <h2 className={styles.h2}>{t("benin.title")}</h2>
            <p className={styles.lead}>{t("benin.text")}</p>
            <ul className={styles.modes}>
              <li className={styles.mode}>
                <h3 className={styles.h3}>{t("benin.modeBenin")}</h3>
                <p className={styles.muted}>{t("benin.modeBeninText")}</p>
              </li>
              <li className={styles.mode}>
                <h3 className={styles.h3}>{t("benin.modeIntl")}</h3>
                <p className={styles.muted}>{t("benin.modeIntlText")}</p>
              </li>
            </ul>
          </section>
        </div>

        <div className={styles.bandWhite}>
          <section className={styles.sectionNarrow}>
            <p className={styles.eyebrow}>{t("faq.eyebrow")}</p>
            <h2 className={styles.h2}>{t("faq.title")}</h2>
            <div className={styles.faq}>
              {[1, 2, 3, 4, 5].map((n) => (
                <details key={n} className={styles.faqItem}>
                  <summary>{t(`faq.${n}.q`)}</summary>
                  <p className={styles.muted}>{t(`faq.${n}.a`)}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        <section className={styles.finalCta}>
          <h2 className={styles.ctaTitle}>{t("cta.title")}</h2>
          <p>{t("cta.text")}</p>
          <Button variant="accent" onClick={start}>
            {cta}
            <Icon name="arrow" size={18} />
          </Button>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <span className={styles.logo}>
              <Mark size={22} className={styles.logoMark} />
              <span className={styles.logoText}>{t("app.name")}</span>
            </span>
            <p className={styles.footerLine}>{t("footer.pitch")}</p>
          </div>
          <div className={styles.footerLang}>
            <span className={styles.footerLabel}>{t("nav.uiLang")}</span>
            <LangToggle lang={lang} onChange={onLang} label={t("nav.uiLang")} />
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>
            {t("footer.madeBy")} {AUTHOR} &middot;{" "}
            <LinkButton variant="ghost" size="small" href={PORTFOLIO_URL} target="_blank" rel="noreferrer">
              {t("footer.portfolio")}
            </LinkButton>
          </p>
          {WHATSAPP_URL && (
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              {t("footer.feedback")}
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
