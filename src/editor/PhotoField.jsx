import { useRef, useState } from "react";
import { useI18n } from "../i18n";
import { compressPhoto } from "../lib/image";
import { Button } from "../components/ui";
import Icon from "../components/Icon";
import styles from "./Editor.module.css";

const ERRORS = {
  type: "field.photo.errType",
  size: "field.photo.errSize",
  pixels: "field.photo.errPixels",
  read: "field.photo.errRead",
};

export default function PhotoField({ photo, onChange }) {
  const { t } = useI18n();
  const input = useRef(null);
  const [error, setError] = useState("");

  const pick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      onChange(await compressPhoto(file));
      setError("");
    } catch (e) {
      setError(t(ERRORS[e.message] || ERRORS.read));
    }
  };

  return (
    <div className={styles.photoField}>
      <p className={styles.fieldLabel}>{t("field.photo")}</p>
      <div className={styles.photoRow}>
        <div className={styles.photoCircle}>
          {photo ? <img src={photo} alt="" /> : <Icon name="user" size={32} />}
        </div>
        <div className={styles.photoActions}>
          <Button variant="secondary" size="small" onClick={() => input.current.click()}>
            <Icon name="camera" size={18} />
            {photo ? t("field.photo.change") : t("field.photo.add")}
          </Button>
          {photo && (
            <Button variant="ghost" size="small" onClick={() => onChange(null)}>
              {t("field.photo.remove")}
            </Button>
          )}
        </div>
      </div>
      <input ref={input} type="file" accept="image/*" hidden onChange={pick} data-testid="photo-input" />
      <p className={styles.mutedSmall}>{t("field.photo.hint")}</p>
      {error && (
        <p className={styles.errorText} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
