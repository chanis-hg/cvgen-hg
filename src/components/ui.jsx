import { useId } from "react";
import styles from "./ui.module.css";

export function Button({ variant = "primary", size, icon: _icon, className = "", children, ...rest }) {
  const classes = [styles.btn, styles[variant], size ? styles[size] : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}

export function LinkButton({ variant = "primary", size, className = "", children, ...rest }) {
  const classes = [styles.btn, styles[variant], size ? styles[size] : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <a className={classes} {...rest}>
      {children}
    </a>
  );
}

export function TextField({
  label,
  hint,
  error,
  optional,
  optionalLabel,
  multiline,
  rows = 4,
  value,
  onChange,
  required,
  select,
  options,
  ...rest
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    className: styles.control,
    value,
    onChange: (e) => onChange(e.target.value),
    "aria-invalid": error ? "true" : undefined,
    "aria-describedby": describedBy,
    required,
    ...rest,
  };
  let control;
  if (select) {
    control = (
      <select {...common}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  } else if (multiline) {
    control = <textarea rows={rows} {...common} />;
  } else {
    control = <input {...common} />;
  }
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {optional && <span className={styles.optional}>({optionalLabel})</span>}
      </label>
      {control}
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

export function Row({ children }) {
  return <div className={styles.row}>{children}</div>;
}
