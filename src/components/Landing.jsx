import { useI18n } from "../i18n";
import { AUTHOR, PORTFOLIO_URL, WHATSAPP_URL } from "../lib/config";
import { Button, LinkButton } from "./ui";
import Icon from "./Icon";
import TemplateThumb from "./TemplateThumb";
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

export default function Landing({ navigate, lang, onLang, hasSaved }) {
  const { t } = useI18n();
  const cta = hasSaved ? t("nav.continue") : t("nav.create");
  const start = () => navigate(hasSaved ? "editor" : "models");

  return (
    <div className={styles.page}>
      <a href="#contenu" className={styles.skip}>
        {t("nav.skip")}
      </a>
      <header className={styles.header}>
        <span className={styles.logo}>
          <img src="/icon.svg" alt="" className={styles.logoMark} width="32" height="32" />
          <span className={styles.logoText}>{t("app.name")}</span>
        </span>
        <div className={styles.headerRight}>
          <LangToggle lang={lang} onChange={onLang} label={t("nav.uiLang")} />
          <Button variant="accent" onClick={start} className={styles.headerCta}>
            {cta}
          </Button>
        </div>
      </header>

      <main id="contenu">
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
          <div className={styles.sampleWrap}>
            <article className={styles.sample} aria-label={t("hero.sample")}>
              <div className={styles.sampleHead}>
                <span className={styles.avatar} aria-hidden="true">
                  AD
                </span>
                <div>
                  <p className={styles.sampleName}>{t("sample.name")}</p>
                  <p className={styles.sampleRole}>{t("sample.title")}</p>
                  <p className={styles.sampleMuted}>{t("sample.contact")}</p>
                </div>
              </div>
              <p className={styles.sampleTitle}>{t("sample.profile")}</p>
              <p className={styles.sampleText}>{t("sample.profileText")}</p>
              <p className={styles.sampleTitle}>{t("sample.education")}</p>
              <p className={styles.sampleText}>{t("sample.educationText")}</p>
              <p className={styles.sampleTitle}>{t("sample.projects")}</p>
              <p className={styles.sampleText}>{t("sample.projectsText")}</p>
            </article>
            <p className={styles.sampleCheck}>
              <Icon name="check" size={18} />
              {t("sample.check")}
            </p>
            <p className={styles.sampleTag}>{t("hero.sample")}</p>
          </div>
        </section>

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

        <section className={styles.section}>
          <p className={styles.eyebrow}>{t("landingModels.eyebrow")}</p>
          <h2 className={styles.h2}>{t("landingModels.title")}</h2>
          <p className={styles.lead}>{t("landingModels.text")}</p>
          <ul className={styles.cards}>
            {["stage", "vitrine"].map((id) => (
              <li key={id} className={styles.modelCard}>
                <div className={styles.thumbBox}>
                  <TemplateThumb id={id} />
                </div>
                <div>
                  <h3 className={styles.h3}>{t(`tpl.${id}.name`)}</h3>
                  <p className={styles.muted}>{t(`tpl.${id}.who`)}</p>
                </div>
              </li>
            ))}
          </ul>
          <Button variant="secondary" onClick={() => navigate("models")}>
            {t("nav.models")}
          </Button>
        </section>

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

        <section className={styles.section}>
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
      </footer>
    </div>
  );
}
