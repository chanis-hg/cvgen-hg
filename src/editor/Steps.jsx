import { useRef, useState } from "react";
import { useI18n } from "../i18n";
import { LIMITS, exportJson, importJson } from "../data/model";
import { validateIdentity } from "../lib/validate";
import { Button, Row, TextField } from "../components/ui";
import Icon from "../components/Icon";
import ItemEditor from "./ItemEditor";
import SkillsEditor from "./SkillsEditor";
import PhotoField from "./PhotoField";
import SummaryAssistant from "./SummaryAssistant";
import FormulaHints from "./FormulaHints";
import GrammarCheck from "./GrammarCheck";
import styles from "./Editor.module.css";

const ERROR_KEYS = { required: "field.required", invalid: null };

function errorText(t, code, invalidKey) {
  if (!code) return undefined;
  return t(code === "required" ? ERROR_KEYS.required : invalidKey);
}

export function IdentityStep({ data, setField, region, showErrors }) {
  const { t } = useI18n();
  const errors = showErrors ? validateIdentity(data) : {};
  const field = (key, extra = {}) => ({
    value: data[key],
    onChange: (v) => setField(key, v),
    ...extra,
  });
  return (
    <div className={styles.stack}>
      <Row>
        <TextField
          label={t("field.firstName")}
          placeholder={t("field.firstName.ph")}
          required
          autoComplete="given-name"
          error={errorText(t, errors.firstName)}
          {...field("firstName")}
        />
        <TextField
          label={t("field.lastName")}
          placeholder={t("field.lastName.ph")}
          required
          autoComplete="family-name"
          error={errorText(t, errors.lastName)}
          {...field("lastName")}
        />
      </Row>
      <TextField
        label={t("field.jobTitle")}
        hint={t("field.jobTitle.hint")}
        placeholder={t("field.jobTitle.ph")}
        required
        error={errorText(t, errors.jobTitle)}
        {...field("jobTitle")}
      />
      <TextField
        label={t("field.email")}
        hint={t("field.email.hint")}
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        error={errorText(t, errors.email, "field.invalidEmail")}
        {...field("email")}
      />
      <Row>
        <TextField
          label={t("field.phone")}
          placeholder={t("field.phone.ph")}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          error={errorText(t, errors.phone, "field.invalidPhone")}
          {...field("phone")}
        />
        <TextField
          label={t("field.location")}
          placeholder={t("field.location.ph")}
          autoComplete="address-level2"
          {...field("location")}
        />
      </Row>
      <TextField
        label={t("field.linkedin")}
        optional
        optionalLabel={t("field.optional")}
        placeholder="linkedin.com/in/nom"
        inputMode="url"
        error={errorText(t, errors.linkedin, "field.invalidUrl")}
        {...field("linkedin")}
      />
      <TextField
        label={t("field.github")}
        optional
        optionalLabel={t("field.optional")}
        placeholder="github.com/nom"
        inputMode="url"
        error={errorText(t, errors.github, "field.invalidUrl")}
        {...field("github")}
      />
      <TextField
        label={t("field.website")}
        optional
        optionalLabel={t("field.optional")}
        placeholder="monportfolio.com"
        inputMode="url"
        error={errorText(t, errors.website, "field.invalidUrl")}
        {...field("website")}
      />
      {region === "benin" && (
        <>
          <PhotoField photo={data.photo} onChange={(v) => setField("photo", v)} />
          <fieldset className={styles.fieldset}>
            <legend>{t("field.civilTitle")}</legend>
            <p className={styles.mutedSmall}>{t("field.civilHint")}</p>
            <Row>
              <TextField label={t("field.birthDate")} placeholder="12/03/2003" {...field("birthDate")} />
              <TextField label={t("field.birthPlace")} placeholder="Cotonou" {...field("birthPlace")} />
            </Row>
            <Row>
              <TextField
                label={t("field.nationality")}
                placeholder={t("field.nationality.ph")}
                {...field("nationality")}
              />
              <TextField
                label={t("field.maritalStatus")}
                placeholder={t("field.maritalStatus.ph")}
                {...field("maritalStatus")}
              />
            </Row>
          </fieldset>
        </>
      )}
    </div>
  );
}

export function ProfileStep({ data, setField, textLang }) {
  const { t } = useI18n();
  return (
    <div className={styles.stack}>
      <TextField
        label={t("field.summary")}
        hint={`${t("field.summary.hint")} ${t("assist.spell")}`}
        placeholder={t("field.summary.ph")}
        multiline
        rows={6}
        spellCheck
        lang={textLang}
        value={data.summary}
        onChange={(v) => setField("summary", v)}
      />
      <p
        className={`${styles.counter} ${data.summary.trim().length < 60 ? styles.counterShort : ""}`}
        aria-live="polite"
      >
        {t("field.summary.count", { n: data.summary.length })}
      </p>
      <FormulaHints text={data.summary} lang={textLang} onApply={(v) => setField("summary", v)} />
      <SummaryAssistant textLang={textLang} onUse={(v) => setField("summary", v)} />
      <GrammarCheck text={data.summary} textLang={textLang} onApply={(v) => setField("summary", v)} />
    </div>
  );
}

const dateFields = (prefix) => [
  { key: "startDate", label: `${prefix}.start`, type: "monthYear", half: true },
  {
    key: "endDate",
    label: `${prefix}.end`,
    type: "monthYear",
    half: true,
    hideWhen: (d) => d.current,
  },
  { key: "current", label: `${prefix}.current`, type: "checkbox" },
];

export function EducationStep({ data, setField, textLang }) {
  const { t } = useI18n();
  const fields = [
    { key: "school", label: "edu.school", ph: "edu.school.ph", required: true },
    { key: "degree", label: "edu.degree", ph: "edu.degree.ph" },
    ...dateFields("edu"),
    { key: "detail", label: "edu.detail", ph: "edu.detail.ph", showOptional: true },
  ];
  const certFields = [
    { key: "name", label: "cert.name", ph: "cert.name.ph", required: true },
    { key: "issuer", label: "cert.issuer", ph: "cert.issuer.ph", half: true },
    { key: "year", label: "cert.year", type: "year", half: true },
    {
      key: "link",
      label: "cert.link",
      hint: "cert.link.hint",
      ph: null,
      showOptional: true,
    },
  ];
  return (
    <div className={styles.stack}>
      <h3 className={styles.subTitle}>{t("edu.title")}</h3>
      <p className={styles.mutedSmall}>{t("edu.hint")}</p>
      <ItemEditor
        items={data.education}
        onChange={(v) => setField("education", v)}
        fields={fields}
        empty={{
          school: "",
          degree: "",
          startDate: "",
          endDate: "",
          current: false,
          detail: "",
        }}
        describe={(i) => ({
          title: i.degree || i.school,
          subtitle: [i.degree ? i.school : "", i.startDate, i.current ? "" : i.endDate]
            .filter(Boolean)
            .join(" · "),
        })}
        addLabel={t("edu.add")}
        emptyTitle={t("edu.empty")}
        emptyText={t("edu.emptyText")}
        textLang={textLang}
      />
      <h3 className={styles.subTitle}>{t("cert.title")}</h3>
      <ItemEditor
        items={data.certifications}
        onChange={(v) => setField("certifications", v)}
        fields={certFields}
        empty={{ name: "", issuer: "", year: "", link: "" }}
        describe={(i) => ({
          title: i.name,
          subtitle: [i.issuer, i.year].filter(Boolean).join(" · "),
        })}
        addLabel={t("cert.add")}
        emptyTitle={t("cert.empty")}
        emptyText={t("cert.emptyText")}
        textLang={textLang}
      />
    </div>
  );
}

export function ExperienceStep({ data, setField, textLang }) {
  const { t } = useI18n();
  const expFields = [
    { key: "company", label: "exp.company", ph: "exp.company.ph", required: true },
    { key: "position", label: "exp.position", ph: "exp.position.ph" },
    ...dateFields("exp"),
    {
      key: "description",
      label: "exp.description",
      ph: "exp.description.ph",
      hint: "exp.description.hint",
      type: "textarea",
      rows: 4,
      suggest: true,
    },
  ];
  const projFields = [
    { key: "name", label: "proj.name", ph: "proj.name.ph", required: true },
    { key: "stack", label: "proj.stack", ph: "proj.stack.ph" },
    { key: "link", label: "proj.link", ph: null, showOptional: true },
    {
      key: "description",
      label: "proj.description",
      ph: "proj.description.ph",
      hint: "proj.description.hint",
      type: "textarea",
      rows: 3,
      suggest: true,
    },
  ];
  return (
    <div className={styles.stack}>
      <h3 className={styles.subTitle}>{t("exp.title")}</h3>
      <ItemEditor
        items={data.experiences}
        onChange={(v) => setField("experiences", v)}
        fields={expFields}
        empty={{
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
        }}
        describe={(i) => ({
          title: i.position || i.company,
          subtitle: [i.position ? i.company : "", i.startDate, i.current ? "" : i.endDate]
            .filter(Boolean)
            .join(" · "),
        })}
        addLabel={t("exp.add")}
        emptyTitle={t("exp.empty")}
        emptyText={t("exp.emptyText")}
        textLang={textLang}
      />
      <h3 className={styles.subTitle}>{t("proj.title")}</h3>
      <ItemEditor
        items={data.projects}
        onChange={(v) => setField("projects", v)}
        fields={projFields}
        empty={{ name: "", stack: "", link: "", description: "" }}
        describe={(i) => ({ title: i.name, subtitle: i.stack })}
        addLabel={t("proj.add")}
        emptyTitle={t("proj.empty")}
        emptyText={t("proj.emptyText")}
        textLang={textLang}
      />
    </div>
  );
}

export function SkillsStep({ data, setField, textLang }) {
  const { t } = useI18n();
  const langFields = [
    { key: "name", label: "lang.name", required: true, half: true },
    {
      key: "level",
      label: "lang.level",
      type: "select",
      half: true,
      options: (tr) => tr("lang.levels").map((label, value) => ({ value, label })),
    },
  ];
  return (
    <div className={styles.stack}>
      <h3 className={styles.subTitle}>{t("skills.title")}</h3>
      <SkillsEditor skills={data.skills} onChange={(v) => setField("skills", v)} />
      <h3 className={styles.subTitle}>{t("lang.title")}</h3>
      <ItemEditor
        items={data.languages}
        onChange={(v) => setField("languages", v)}
        fields={langFields}
        empty={{ name: "", level: 2 }}
        describe={(i, tr) => ({
          title: i.name,
          subtitle: tr("lang.levels")[i.level] ?? tr("lang.levels")[2],
        })}
        addLabel={t("lang.add")}
        emptyTitle={t("lang.empty")}
        emptyText={t("lang.emptyText")}
        textLang={textLang}
      />
    </div>
  );
}

export function FinishStep({ data, settings, checks, pages, onImport, onReset, onDownload, onGoToStep }) {
  const { t } = useI18n();
  const file = useRef(null);
  const [message, setMessage] = useState("");
  const [printed, setPrinted] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const todo = (checks || []).filter((c) => !c.ok);

  const doExport = () => {
    const blob = new Blob([exportJson(data, settings)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cv-donnees.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = async (event) => {
    const chosen = event.target.files?.[0];
    event.target.value = "";
    if (!chosen) return;
    if (chosen.size > LIMITS.fileBytes) {
      setMessage(t("finish.importError"));
      return;
    }
    try {
      onImport(importJson(await chosen.text()));
      setMessage(t("finish.importOk"));
    } catch {
      setMessage(t("finish.importError"));
    }
  };

  const download = () => {
    setPrinted(true);
    onDownload();
  };

  return (
    <div className={styles.stack}>
      <p>{t("finish.text")}</p>

      {/* The instruction above asks the user to act on the check, so the check
          belongs here and not below a full A4 sheet in the other panel. */}
      <div className={styles.card}>
        <h3 className={styles.subTitle}>{t("editor.checks")}</h3>
        {todo.length === 0 ? (
          <p className={styles.checkAllOk}>
            <Icon name="check" size={18} />
            {t("finish.allOk")}
          </p>
        ) : (
          <>
            <p className={styles.mutedSmall}>{t("finish.todoCount", { n: todo.length })}</p>
            <ul className={styles.plainList}>
              {todo.map((c) => (
                <li key={c.id} className={`${styles.check} ${styles.checkTodo}`}>
                  <Icon name="warning" size={18} />
                  <span>
                    {t(`check.${c.id}`)}
                    {c.id === "pages" ? ` (${pages})` : ""}
                  </span>
                </li>
              ))}
            </ul>
            {onGoToStep && (
              <Button variant="secondary" size="small" onClick={() => onGoToStep(0)}>
                {t("finish.backToSteps")}
              </Button>
            )}
          </>
        )}
      </div>

      <div className={styles.actions}>
        <Button variant="accent" onClick={download}>
          <Icon name="download" size={18} />
          {t("editor.download")}
        </Button>
      </div>
      <p className={styles.mutedSmall} aria-live="polite">
        {printed ? t("editor.downloadDone") : t("editor.downloadHint")}
      </p>

      <div className={styles.card}>
        <h3 className={styles.subTitle}>{t("finish.data")}</h3>
        <p className={styles.mutedSmall}>{t("finish.dataText")}</p>
        <div className={styles.actions}>
          <Button variant="secondary" size="small" onClick={doExport}>
            {t("finish.export")}
          </Button>
          <Button variant="secondary" size="small" onClick={() => file.current.click()}>
            {t("finish.import")}
          </Button>
        </div>
        <input
          ref={file}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={doImport}
          data-testid="import-input"
        />
        <p className={styles.mutedSmall} aria-live="polite">
          {message}
        </p>
      </div>

      {/* Out of the card above and in danger colours: deleting everything is
          not a sibling of export and import. window.confirm was the only guard
          and it is suppressed in some in-app browsers. */}
      <div className={styles.danger}>
        {confirmingReset ? (
          <div className={styles.stack}>
            <p className={styles.dangerText}>{t("finish.resetConfirm")}</p>
            <div className={styles.actions}>
              <Button
                variant="secondary"
                size="small"
                className={styles.dangerButton}
                onClick={() => {
                  onReset();
                  setConfirmingReset(false);
                  setMessage(t("finish.resetDone"));
                }}
              >
                <Icon name="trash" size={18} />
                {t("finish.resetYes")}
              </Button>
              <Button variant="ghost" size="small" onClick={() => setConfirmingReset(false)}>
                {t("list.cancel")}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="small"
            className={styles.dangerButton}
            onClick={() => setConfirmingReset(true)}
          >
            {t("finish.reset")}
          </Button>
        )}
      </div>
    </div>
  );
}
