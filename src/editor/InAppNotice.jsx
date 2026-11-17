import { useState } from "react";
import { useI18n } from "../i18n";
import { isInAppBrowser } from "../lib/browser";
import { Button } from "../components/ui";
import styles from "./Editor.module.css";

export default function InAppNotice() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  if (!isInAppBrowser()) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={styles.inAppNotice} role="status">
      <p>
        <strong>{t("inapp.title")}</strong> {t("inapp.body")}
      </p>
      <Button variant="secondary" size="small" onClick={copy}>
        {copied ? t("inapp.copied") : t("inapp.copy")}
      </Button>
    </div>
  );
}
