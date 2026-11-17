import { useState } from "react";
import { useI18n } from "../i18n";
import { newId } from "../data/model";
import { Button, Row, TextField } from "../components/ui";
import MonthYearField from "../components/MonthYearField";
import { yearOptions } from "../lib/dates";
import Icon from "../components/Icon";
import FormulaHints from "./FormulaHints";
import styles from "./Editor.module.css";

function move(list, index, delta) {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export default function ItemEditor({
  items,
  onChange,
  fields,
  empty,
  describe,
  addLabel,
  textLang,
  emptyTitle,
  emptyText,
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [missing, setMissing] = useState(false);
  /* Two of these sit on one step. Left permanently open they made that step
     the longest screen of the flow, and a student with no experience yet had
     to scroll past an empty form to reach the part that matters to them. */
  const [open, setOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const required = fields.find((f) => f.required);

  const setValue = (key, value) => {
    setDraft((d) => ({ ...d, [key]: value }));
    if (key === required?.key) setMissing(false);
  };

  const reset = () => {
    setDraft(empty);
    setEditingId(null);
    setMissing(false);
    setOpen(false);
  };

  const submit = (event) => {
    event.preventDefault();
    if (required && !String(draft[required.key] || "").trim()) {
      setMissing(true);
      return;
    }
    if (editingId)
      onChange(items.map((item) => (item.id === editingId ? { ...draft, id: editingId } : item)));
    else onChange([...items, { ...draft, id: newId() }]);
    reset();
  };

  const startEdit = (item) => {
    setDraft({ ...empty, ...item });
    setEditingId(item.id);
    setMissing(false);
    setOpen(true);
  };

  const remove = (item) => {
    onChange(items.filter((i) => i.id !== item.id));
    if (editingId === item.id) reset();
  };

  const renderField = (f) => {
    if (f.hideWhen && f.hideWhen(draft)) return null;
    if (f.type === "checkbox") {
      return (
        <label key={f.key} className={styles.checkbox}>
          <input
            type="checkbox"
            checked={Boolean(draft[f.key])}
            onChange={(e) => setValue(f.key, e.target.checked)}
          />
          {t(f.label)}
        </label>
      );
    }
    if (f.type === "monthYear") {
      return (
        <MonthYearField
          key={f.key}
          label={t(f.label)}
          hint={f.hint ? t(f.hint) : undefined}
          value={draft[f.key] ?? ""}
          onChange={(v) => setValue(f.key, v)}
        />
      );
    }
    // A year on its own, kept as a string: the select options and the stored
    // value are the same four digits, so nothing has to be parsed back.
    if (f.type === "year") {
      return (
        <TextField
          key={f.key}
          label={t(f.label)}
          hint={f.hint ? t(f.hint) : undefined}
          value={draft[f.key] ?? ""}
          onChange={(v) => setValue(f.key, v)}
          select
          options={[
            { value: "", label: t("field.year.none") },
            ...yearOptions().map((y) => ({ value: y, label: y })),
          ]}
          required={f.required}
          optional={!f.required && f.showOptional}
          optionalLabel={t("field.optional")}
        />
      );
    }
    const isSelect = f.type === "select";
    return (
      <TextField
        key={f.key}
        label={t(f.label)}
        hint={f.hint ? t(f.hint) : undefined}
        placeholder={f.ph ? t(f.ph) : undefined}
        value={draft[f.key] ?? ""}
        onChange={(v) => setValue(f.key, isSelect ? Number(v) : v)}
        multiline={f.type === "textarea"}
        rows={f.rows || 3}
        select={isSelect}
        options={isSelect ? f.options(t) : undefined}
        required={f.required}
        optional={!f.required && f.showOptional}
        optionalLabel={t("field.optional")}
        error={f.required && missing ? t("list.nameRequired") : undefined}
        spellCheck={f.type === "textarea" || f.type === "text" ? true : undefined}
        lang={textLang}
      />
    );
  };

  const rows = [];
  let buffer = [];
  fields.forEach((f) => {
    if (f.half) {
      buffer.push(f);
      if (buffer.length === 2) {
        rows.push(buffer);
        buffer = [];
      }
    } else {
      if (buffer.length) {
        rows.push(buffer);
        buffer = [];
      }
      rows.push([f]);
    }
  });
  if (buffer.length) rows.push(buffer);

  const suggestField = fields.find((f) => f.suggest);

  const addButton = (
    <Button variant="accent" onClick={() => setOpen(true)}>
      <Icon name="plus" size={18} />
      {addLabel}
    </Button>
  );

  return (
    <div className={styles.stack}>
      {!open && items.length === 0 && (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>{emptyTitle || t("list.empty")}</p>
          {emptyText && <p className={styles.mutedSmall}>{emptyText}</p>}
          {addButton}
        </div>
      )}

      {open && (
        <form className={`${styles.card} ${styles.addForm}`} onSubmit={submit} noValidate>
          {editingId && <p className={styles.editingBadge}>{t("list.editing")}</p>}
          {rows.map((group, i) =>
            group.length === 2 ? (
              <Row key={i}>{group.map(renderField)}</Row>
            ) : (
              <div key={i}>{renderField(group[0])}</div>
            ),
          )}
          {suggestField && (
            <FormulaHints
              text={String(draft[suggestField.key] || "")}
              lang={textLang}
              onApply={(text) => setValue(suggestField.key, text)}
            />
          )}
          <div className={styles.actions}>
            <Button type="submit" variant="accent">
              <Icon name={editingId ? "check" : "plus"} size={18} />
              {editingId ? t("list.save") : addLabel}
            </Button>
            <Button variant="ghost" onClick={reset}>
              {t("list.cancel")}
            </Button>
          </div>
        </form>
      )}

      {items.length > 0 && (
        <ul className={styles.plainList}>
          {items.map((item, index) => {
            const { title, subtitle } = describe(item, t);
            const confirming = pendingDelete === item.id;
            return (
              <li
                key={item.id}
                className={`${styles.itemRow} ${item.id === editingId ? styles.itemActive : ""} ${
                  confirming ? styles.itemDanger : ""
                }`}
              >
                <div className={styles.itemText}>
                  <p className={styles.itemTitle}>{confirming ? t("list.removeAsk") : title}</p>
                  {!confirming && subtitle && <p className={styles.mutedSmall}>{subtitle}</p>}
                  {confirming && <p className={styles.mutedSmall}>{title}</p>}
                </div>
                {confirming ? (
                  <div className={styles.itemButtons}>
                    <Button
                      variant="secondary"
                      size="small"
                      className={styles.dangerButton}
                      onClick={() => {
                        remove(item);
                        setPendingDelete(null);
                      }}
                    >
                      {t("list.removeYes")}
                    </Button>
                    <Button variant="ghost" size="small" onClick={() => setPendingDelete(null)}>
                      {t("list.cancel")}
                    </Button>
                  </div>
                ) : (
                  <div className={styles.itemButtons}>
                    <Button
                      variant="ghost"
                      className={styles.iconButton}
                      aria-label={`${t("list.up")} : ${title}`}
                      disabled={index === 0}
                      onClick={() => onChange(move(items, index, -1))}
                    >
                      <Icon name="up" size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      className={styles.iconButton}
                      aria-label={`${t("list.down")} : ${title}`}
                      disabled={index === items.length - 1}
                      onClick={() => onChange(move(items, index, 1))}
                    >
                      <Icon name="down" size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      className={styles.iconButton}
                      aria-label={`${t("list.edit")} : ${title}`}
                      onClick={() => startEdit(item)}
                    >
                      <Icon name="edit" size={18} />
                    </Button>
                    {/* Set apart on purpose: four 36 px targets in a row put
                        the destructive one a thumb-width from "move up". */}
                    <Button
                      variant="ghost"
                      className={`${styles.iconButton} ${styles.iconDanger}`}
                      aria-label={`${t("list.remove")} : ${title}`}
                      onClick={() => setPendingDelete(item.id)}
                    >
                      <Icon name="trash" size={18} />
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {!open && items.length > 0 && addButton}
    </div>
  );
}
