import { useState } from "react";
import { useI18n } from "../i18n";
import { GOAL_KEYS, LEVEL_KEYS, buildSummaries } from "../lib/phrases";
import { Button, Row, TextField } from "../components/ui";
import Icon from "../components/Icon";
import styles from "./Editor.module.css";

export default function SummaryAssistant({ textLang, onUse }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ level: "l3", field: "", goal: "internship", domain: "", strength: "" });
  const [variants, setVariants] = useState([]);
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className={styles.assistant}>
      <Button variant="secondary" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="spark" size={18} />
        {t("assist.open")}
      </Button>
      {open && (
        <div className={styles.card}>
          <p className={styles.mutedSmall}>{t("assist.text")}</p>
          <Row>
            <TextField
              label={t("assist.level")}
              select
              value={form.level}
              onChange={set("level")}
              options={LEVEL_KEYS.map((k) => ({ value: k, label: t(`assist.level.${k}`) }))}
            />
            <TextField
              label={t("assist.goal")}
              select
              value={form.goal}
              onChange={set("goal")}
              options={GOAL_KEYS.map((k) => ({ value: k, label: t(`assist.goal.${k}`) }))}
            />
          </Row>
          <TextField
            label={t("assist.field")}
            placeholder={t("assist.field.ph")}
            value={form.field}
            onChange={set("field")}
          />
          <TextField
            label={t("assist.domain")}
            placeholder={t("assist.domain.ph")}
            value={form.domain}
            onChange={set("domain")}
          />
          <TextField
            label={t("assist.strength")}
            placeholder={t("assist.strength.ph")}
            value={form.strength}
            onChange={set("strength")}
          />
          <div className={styles.actions}>
            <Button variant="accent" onClick={() => setVariants(buildSummaries(form, textLang))}>
              {t("assist.build")}
            </Button>
          </div>
          {variants.length > 0 && (
            <div>
              <p className={styles.hintsTitle}>{t("assist.variants")}</p>
              <ol className={styles.variants}>
                {variants.map((text, i) => (
                  <li key={i} className={styles.variant}>
                    <p>{text}</p>
                    <Button variant="secondary" size="small" onClick={() => onUse(text)}>
                      {t("assist.use")}
                    </Button>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
