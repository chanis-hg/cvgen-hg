import { useId, useState } from "react";
import { useI18n } from "../i18n";
import { formatMonthYear, parseMonthYear, yearOptions } from "../lib/dates";
import styles from "./ui.module.css";

const YEARS = yearOptions();

/**
 * Two selects instead of a free text box: a beginner never has to guess the
 * format, typing on a phone is one tap, and the value that lands in the CV is
 * always MM/YYYY — the only form tracking systems read reliably.
 *
 * A month with no year is not a date, so it cannot be stored. It is held here
 * instead, otherwise picking the month first would silently throw it away.
 */
export default function MonthYearField({ label, hint, value, onChange }) {
  const { t } = useI18n();
  const id = useId();
  const labelId = `${id}-label`;
  const hintId = hint ? `${id}-hint` : undefined;

  const [local, setLocal] = useState(() => parseMonthYear(value));
  const [seenValue, setSeenValue] = useState(value);
  if (value !== seenValue) {
    // changed from the outside (another entry opened, import, reset)
    setSeenValue(value);
    setLocal(parseMonthYear(value));
  }

  const { month, year } = local;
  const months = t("date.months");
  const raw = String(value ?? "").trim();
  const freeText = raw && !parseMonthYear(raw).year ? raw : "";

  const update = (nextMonth, nextYear) => {
    setLocal({ month: nextMonth, year: nextYear });
    const next = formatMonthYear(nextMonth, nextYear);
    setSeenValue(next);
    onChange(next);
  };

  return (
    <div className={styles.dateField} role="group" aria-labelledby={labelId}>
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      <div className={styles.dateRow}>
        <select
          className={styles.control}
          aria-label={`${label} — ${t("date.month")}`}
          aria-describedby={hintId}
          value={month}
          onChange={(e) => update(e.target.value, year)}
        >
          <option value="">{t("date.month")}</option>
          {months.map((name, index) => (
            <option key={name} value={String(index + 1).padStart(2, "0")}>
              {name}
            </option>
          ))}
        </select>
        <select
          className={styles.control}
          aria-label={`${label} — ${t("date.year")}`}
          aria-describedby={hintId}
          value={year}
          onChange={(e) => update(month, e.target.value)}
        >
          <option value="">{t("date.year")}</option>
          {YEARS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      {freeText && <p className={styles.hint}>{t("date.kept", { value: freeText })}</p>}
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}
