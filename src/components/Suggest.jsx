import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useI18n } from "../i18n";
import styles from "./Suggest.module.css";

// Normalise pour comparer : « Électricité » doit se trouver en tapant
// « electri », et « Vue.js » en tapant « vue js ». Sans ça, les accents et
// la ponctuation font échouer des recherches parfaitement légitimes, ce qui
// est le plus sûr moyen de faire abandonner la liste.
function fold(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Ce qui commence par la saisie passe devant ce qui la contient ailleurs :
// en tapant « ex », on veut Excel avant « Gestion des expéditions ».
function rank(options, query) {
  if (!query) return options;
  const q = fold(query);
  const starts = [];
  const contains = [];
  for (const option of options) {
    const f = fold(option);
    if (f.startsWith(q)) starts.push(option);
    else if (f.includes(q)) contains.push(option);
  }
  return [...starts, ...contains];
}

/**
 * Champ de saisie avec liste de suggestions.
 *
 * Au clic, la liste complète s'ouvre : on choisit sans rien taper. Dès
 * qu'on tape, elle se filtre et le champ se complète tout seul, la partie
 * devinée restant sélectionnée — Tab ou Entrée l'accepte, continuer à
 * taper l'écrase. Ce qui ne figure dans aucune liste se saisit normalement
 * et s'ajoute tel quel.
 *
 * Tab ne détourne la navigation que lorsqu'une complétion est réellement
 * en attente. Autrement il fait ce qu'il doit faire : passer au champ
 * suivant. Un piège au clavier serait un défaut plus grave que la frappe
 * qu'on cherche à éviter.
 */
export default function Suggest({
  label,
  hint,
  placeholder,
  options,
  value,
  onChange,
  onCommit,
  optional,
  optionalLabel,
  error,
  required,
  id: idProp,
  name,
  autoComplete = "off",
}) {
  const { t } = useI18n();
  const reactId = useId();
  const id = idProp ?? reactId;
  const listId = `${id}-list`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  const matches = useMemo(() => rank(options, value).slice(0, 50), [options, value]);

  // Ce que la personne a tapé et qui ne figure nulle part reste proposable
  // tel quel : la liste aide, elle ne décide pas de ce qu'un parcours
  // contient.
  // « Ajouter X » n'apparaît que si rien ne correspond. Le proposer en
  // pleine frappe, alors que la liste montre déjà de bonnes réponses, ne
  // fait qu'ajouter une ligne de bruit au-dessus de ce qu'on cherche.
  const ownValue = value.trim();
  const isOwnOnly = Boolean(ownValue) && matches.length === 0;
  const items = isOwnOnly ? [ownValue] : matches;

  const close = useCallback(() => {
    setOpen(false);
    setActive(-1);
  }, []);

  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) close();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [close]);

  // Tab complète, la frappe non. Un champ qui se réécrit pendant qu'on
  // tape fait douter de ce qu'il contient vraiment ; ici rien ne change
  // tant que la personne ne le demande pas.
  //
  // Et Tab ne complète que si la première proposition prolonge exactement
  // ce qui est déjà tapé. Autrement il fait son travail habituel et passe
  // au champ suivant : on ne piège jamais le clavier.
  const prefixCompletion = () => {
    if (!ownValue) return null;
    const best = matches[0];
    if (!best) return null;
    const a = fold(best);
    const b = fold(ownValue);
    return a.startsWith(b) && a !== b ? best : null;
  };

  const handleChange = (e) => {
    onChange(e.target.value);
    setOpen(true);
    setActive(-1);
  };

  const choose = (choice) => {
    onChange(choice);
    close();
    if (onCommit) onCommit(choice);
    else inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    // Effacer ne doit jamais relancer la complétion, sinon le champ se
    // remplit à nouveau tout seul et devient impossible à vider.
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setActive((i) => (items.length ? (i + 1) % items.length : -1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) setOpen(true);
      setActive((i) => (items.length ? (i <= 0 ? items.length - 1 : i - 1) : -1));
      return;
    }
    if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        close();
      }
      return;
    }
    if (e.key === "Tab") {
      if (open && active >= 0 && items[active]) {
        e.preventDefault();
        onChange(items[active]);
        close();
        return;
      }
      const completion = prefixCompletion();
      if (open && completion) {
        e.preventDefault();
        onChange(completion);
        close();
      }
      return;
    }
    if (e.key === "Enter") {
      if (open && active >= 0 && items[active]) {
        e.preventDefault();
        choose(items[active]);
        return;
      }
      // Sans sélection explicite, Entrée valide ce que la personne a tapé,
      // jamais la première proposition : elle n'a rien choisi.
      close();
    }
  };

  const activeId = active >= 0 && items[active] ? `${id}-opt-${active}` : undefined;

  return (
    <div className={styles.field} ref={wrapRef}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {optional && <span className={styles.optional}>({optionalLabel})</span>}
      </label>
      <div className={styles.wrap}>
        <input
          id={id}
          name={name}
          ref={inputRef}
          type="text"
          className={styles.control}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="both"
          aria-activedescendant={activeId}
          aria-describedby={describedBy}
          aria-invalid={error ? "true" : undefined}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
        />
        <ul
          id={listId}
          role="listbox"
          aria-label={t("suggest.listLabel")}
          className={styles.list}
          hidden={!open || items.length === 0}
        >
          {items.map((item, i) => {
            const isOwn = isOwnOnly;
            return (
              <li
                key={`${item}-${i}`}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={i === active}
                className={`${styles.option} ${i === active ? styles.optionActive : ""}`}
                // pointerdown plutôt que click : le champ perdrait le focus
                // avant que le clic n'arrive, et la liste se refermerait sur
                // le doigt de la personne.
                onPointerDown={(e) => {
                  e.preventDefault();
                  choose(item);
                }}
                onMouseEnter={() => setActive(i)}
              >
                {isOwn ? (
                  <>
                    <span className={styles.ownTag}>{t("suggest.add")}</span>
                    {item}
                  </>
                ) : (
                  <Highlight text={item} query={value} />
                )}
              </li>
            );
          })}
        </ul>
      </div>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// La partie déjà tapée est mise en gras dans chaque proposition : on voit
// d'un coup d'œil pourquoi une ligne est là.
function Highlight({ text, query }) {
  const q = fold(query);
  if (!q) return text;
  const f = fold(text);
  const at = f.indexOf(q);
  if (at < 0) return text;
  // fold() peut changer la longueur de la chaîne ; on ne surligne donc que
  // lorsque les positions se correspondent encore, pour ne jamais couper un
  // mot au mauvais endroit.
  if (f.length !== text.length) return text;
  return (
    <>
      {text.slice(0, at)}
      <b className={styles.match}>{text.slice(at, at + q.length)}</b>
      {text.slice(at + q.length)}
    </>
  );
}
