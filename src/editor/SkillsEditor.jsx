import { useState } from "react";
import { useI18n } from "../i18n";
import { newId } from "../data/model";
import { Button, TextField } from "../components/ui";
import Icon from "../components/Icon";
import styles from "./Editor.module.css";

export default function SkillsEditor({ skills, onChange }) {
  const { t } = useI18n();
  const [value, setValue] = useState("");

  const add = (event) => {
    event.preventDefault();
    const names = value
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean)
      .filter((n) => !skills.some((s) => s.name.toLowerCase() === n.toLowerCase()));
    if (names.length === 0) return;
    onChange([...skills, ...names.map((name) => ({ id: newId(), name }))]);
    setValue("");
  };

  return (
    <div className={styles.stack}>
      <form className={styles.inlineForm} onSubmit={add}>
        <TextField
          label={t("skills.name")}
          hint={t("skills.hint")}
          placeholder={t("skills.ph")}
          value={value}
          onChange={setValue}
        />
        <Button type="submit" variant="accent" className={styles.inlineButton}>
          <Icon name="plus" size={18} />
          {t("skills.add")}
        </Button>
      </form>
      {skills.length === 0 ? (
        <p className={styles.mutedSmall}>{t("list.empty")}</p>
      ) : (
        <ul className={`${styles.plainList} ${styles.chips}`}>
          {skills.map((s) => (
            <li key={s.id} className={styles.chip}>
              {s.name}
              <button
                type="button"
                className={styles.chipRemove}
                aria-label={t("skills.remove", { name: s.name })}
                onClick={() => onChange(skills.filter((x) => x.id !== s.id))}
              >
                <Icon name="close" size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
