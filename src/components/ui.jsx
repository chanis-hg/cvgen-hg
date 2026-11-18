import { useEffect, useId, useRef } from "react";
import styles from "./ui.module.css";

/**
 * A modal built on the native <dialog>.
 *
 * showModal() gives the focus trap, the Escape key, the top layer and the
 * return of focus to whatever opened it — all things a hand-rolled overlay
 * gets wrong. jsdom does not implement it, so the fallback below keeps the
 * tests meaningful: the content is in the document either way.
 */
export function Modal({ open, onClose, label, size, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) {
      if (typeof el.showModal === "function") {
        if (!el.open) el.showModal();
      } else {
        el.setAttribute("open", "");
      }
    } else if (typeof el.close === "function") {
      if (el.open) el.close();
    } else {
      el.removeAttribute("open");
    }
  }, [open]);

  if (!open) return null;
  return (
    <dialog
      ref={ref}
      className={`${styles.modal} ${size === "small" ? styles.modalSmall : ""}`}
      aria-label={label}
      onCancel={onClose}
      onClose={onClose}
    >
      {children}
    </dialog>
  );
}

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
