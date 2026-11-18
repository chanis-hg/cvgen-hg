import { useMemo, useState } from "react";
import { useI18n } from "../i18n";
import { newId } from "../data/model";
import { Button } from "../components/ui";
import Suggest from "../components/Suggest";
import { suggestionsFor } from "../data/suggestions";
import Icon from "../components/Icon";
import styles from "./Editor.module.css";

export default function SkillsEditor({ skills, onChange }) {
  const { t } = useI18n();
  const [value, setValue] = useState("");

  // Ce qui est déjà sur le CV sort de la liste : proposer à nouveau une
  // compétence déjà ajoutée n'aide personne et allonge le défilement.
  const options = useMemo(() => {
    const taken = new Set(skills.map((s) => s.name.toLowerCase()));
    return suggestionsFor("skills").filter((name) => !taken.has(name.toLowerCase()));
  }, [skills]);

  const addNames = (raw) => {
    // La saisie séparée par des virgules reste acceptée : quelqu'un qui
    // colle « React, Git, Figma » depuis une offre d'emploi ne doit pas
    // avoir à les séparer à la main.
    const names = String(raw)
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean)
      .filter((n) => !skills.some((s) => s.name.toLowerCase() === n.toLowerCase()));
    if (names.length === 0) return false;
    onChange([...skills, ...names.map((name) => ({ id: newId(), name }))]);
    return true;
  };

  const commit = (raw) => {
    if (addNames(raw)) setValue("");
  };

  return (
    <div className={styles.stack}>
      <form
        className={styles.inlineForm}
        onSubmit={(e) => {
          e.preventDefault();
          commit(value);
        }}
      >
        <Suggest
          label={t("skills.name")}
          hint={t("skills.hint")}
          placeholder={t("skills.ph")}
          options={options}
          value={value}
          onChange={setValue}
          onCommit={commit}
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
