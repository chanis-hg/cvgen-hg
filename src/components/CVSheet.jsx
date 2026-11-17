import { CV_LABELS } from "../i18n/cv";
import { getTemplate } from "../data/templates";
import { displayUrl, mailHref, telHref, toHref } from "../lib/validate";
import styles from "./CVSheet.module.css";

function dates(item, labels) {
  const start = (item.startDate || "").trim();
  const end = item.current ? labels.present : (item.endDate || "").trim();
  if (start && end) return `${start} - ${end}`;
  return start || end;
}

function Lines({ text }) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length <= 1) return lines[0] ? <p className={styles.text}>{lines[0]}</p> : null;
  return (
    <ul className={styles.bullets}>
      {lines.map((line, i) => (
        <li key={i}>{line.replace(/^[-*]\s*/, "")}</li>
      ))}
    </ul>
  );
}

function Section({ title, children }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

function ExternalLink({ value, className }) {
  return (
    <a href={toHref(value)} className={className} target="_blank" rel="noreferrer">
      {displayUrl(value)}
    </a>
  );
}

// Everything clickable carries the same blue, so the reader can tell at a
// glance what responds to a tap. Plain text, like the city, stays in the ink
// colour.
function ContactBit({ item }) {
  if (!item.href) return item.text;
  return (
    <a href={item.href} className={styles.link}>
      {item.text}
    </a>
  );
}

function renderSection(name, { data, labels, template }) {
  switch (name) {
    case "summary":
      if (!data.summary.trim()) return null;
      return (
        <Section key={name} title={labels.summary}>
          <p className={styles.text}>{data.summary.trim()}</p>
        </Section>
      );
    case "skills": {
      if (!data.skills.length) return null;
      const title =
        template.id === "dev"
          ? labels.skillsTech
          : template.id === "hybride"
            ? labels.skillsKey
            : labels.skills;
      return (
        <Section key={name} title={title}>
          <p className={styles.text}>{data.skills.map((s) => s.name).join(" · ")}</p>
        </Section>
      );
    }
    case "experience":
      if (!data.experiences.length) return null;
      return (
        <Section key={name} title={labels.experience}>
          {data.experiences.map((item) => (
            <article key={item.id} className={styles.entry}>
              <div className={styles.entryHead}>
                <h3 className={styles.entryTitle}>{item.position || item.company}</h3>
                <span className={styles.dates}>{dates(item, labels)}</span>
              </div>
              {item.position && item.company && <p className={styles.org}>{item.company}</p>}
              {item.description && <Lines text={item.description} />}
            </article>
          ))}
        </Section>
      );
    case "education":
      if (!data.education.length) return null;
      return (
        <Section key={name} title={labels.education}>
          {data.education.map((item) => (
            <article key={item.id} className={styles.entry}>
              <div className={styles.entryHead}>
                <h3 className={styles.entryTitle}>{item.degree || item.school}</h3>
                <span className={styles.dates}>{dates(item, labels)}</span>
              </div>
              {item.degree && item.school && <p className={styles.org}>{item.school}</p>}
              {item.detail && <p className={styles.text}>{item.detail}</p>}
            </article>
          ))}
        </Section>
      );
    case "certifications":
      if (!data.certifications.length) return null;
      return (
        <Section key={name} title={labels.certifications}>
          {data.certifications.map((item) => (
            // The year stays inline instead of flush right. On a one-line
            // entry a right-aligned run is lifted out of the reading order,
            // and every year lands in a clump at the end of the extracted
            // text, attached to nothing a tracking system can use.
            <article key={item.id} className={styles.certEntry}>
              <h3 className={styles.entryTitle}>
                {item.link ? (
                  <a href={toHref(item.link)} className={styles.link} target="_blank" rel="noreferrer">
                    {item.name}
                  </a>
                ) : (
                  item.name
                )}
                {item.issuer && <span className={styles.certMeta}> · {item.issuer}</span>}
                {item.year && <span className={styles.certMeta}> · {item.year}</span>}
              </h3>
            </article>
          ))}
        </Section>
      );
    case "projects":
      if (!data.projects.length) return null;
      return (
        <Section key={name} title={labels.projects}>
          {data.projects.map((item) => (
            <article key={item.id} className={styles.entry}>
              <div className={styles.entryHead}>
                <h3 className={styles.entryTitle}>{item.name}</h3>
                {item.link && <ExternalLink value={item.link} className={`${styles.dates} ${styles.link}`} />}
              </div>
              {item.stack && <p className={styles.org}>{item.stack}</p>}
              {item.description && <Lines text={item.description} />}
            </article>
          ))}
        </Section>
      );
    case "languages":
      if (!data.languages.length) return null;
      return (
        <Section key={name} title={labels.languages}>
          <p className={styles.text}>
            {data.languages
              .map((l) => `${l.name} (${labels.levels[l.level] ?? labels.levels[2]})`)
              .join(" · ")}
          </p>
        </Section>
      );
    default:
      return null;
  }
}

function civilLine(data, labels) {
  const parts = [];
  if (data.birthDate.trim()) {
    const place = data.birthPlace.trim() ? ` ${labels.bornIn} ${data.birthPlace.trim()}` : "";
    parts.push(`${labels.bornOn} ${data.birthDate.trim()}${place}`);
  } else if (data.birthPlace.trim()) {
    parts.push(`${labels.bornIn} ${data.birthPlace.trim()}`);
  }
  if (data.nationality.trim()) parts.push(`${labels.nationality} : ${data.nationality.trim()}`);
  if (data.maritalStatus.trim()) parts.push(`${labels.marital} : ${data.maritalStatus.trim()}`);
  return parts.join(" · ");
}

export default function CVSheet({ data, templateId, region, cvLang, id }) {
  const template = getTemplate(templateId);
  const labels = CV_LABELS[cvLang] || CV_LABELS.fr;
  const showBenin = region === "benin";
  const name = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();
  const contact = [
    { text: data.location.trim(), href: null },
    { text: data.phone.trim(), href: telHref(data.phone) },
    { text: data.email.trim(), href: mailHref(data.email) },
  ].filter((c) => c.text);
  const links = ["linkedin", "github", "website"].filter((k) => data[k].trim());
  const civil = showBenin ? civilLine(data, labels) : "";
  const ctx = { data, labels, template };

  const linkRow = links.length > 0 && (
    <p className={styles.links}>
      {links.map((k) => (
        <ExternalLink key={k} value={data[k]} className={styles.link} />
      ))}
    </p>
  );

  const identity = (
    <>
      <h1 className={styles.name}>
        {name || <span className={styles.placeholder}>{labels.placeholderName}</span>}
      </h1>
      <p className={styles.jobTitle}>
        {data.jobTitle.trim() || <span className={styles.placeholder}>{labels.placeholderTitle}</span>}
      </p>
    </>
  );

  if (template.layout === "two") {
    return (
      <div id={id} className={`${styles.sheet} ${styles.two}`} data-cv-sheet data-template={template.id}>
        <aside className={styles.aside}>
          {showBenin && data.photo && <img src={data.photo} alt="" className={styles.photoLarge} />}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{labels.contact}</h2>
            <ul className={styles.contactList}>
              {contact.map((c) => (
                <li key={c.text}>
                  <ContactBit item={c} />
                </li>
              ))}
              {links.map((k) => (
                <li key={k}>
                  <ExternalLink value={data[k]} className={styles.link} />
                </li>
              ))}
            </ul>
            {civil && <p className={styles.civil}>{civil}</p>}
          </section>
          {template.aside.map((s) => renderSection(s, ctx))}
        </aside>
        <div className={styles.mainCol}>
          <header className={styles.headerTwo}>{identity}</header>
          {template.main.map((s) => renderSection(s, ctx))}
          {showBenin && <p className={styles.references}>{labels.references}</p>}
        </div>
      </div>
    );
  }

  return (
    <div id={id} className={styles.sheet} data-cv-sheet data-template={template.id}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          {identity}
          {template.showLinksFirst && linkRow}
          {contact.length > 0 && (
            <p className={styles.contact}>
              {contact.map((c, i) => (
                <span key={c.text}>
                  {i > 0 && " · "}
                  <ContactBit item={c} />
                </span>
              ))}
            </p>
          )}
          {!template.showLinksFirst && linkRow}
          {civil && <p className={styles.civil}>{civil}</p>}
        </div>
        {showBenin && data.photo && <img src={data.photo} alt="" className={styles.photo} />}
      </header>
      {template.sections.map((s) => renderSection(s, ctx))}
      {showBenin && <p className={styles.references}>{labels.references}</p>}
    </div>
  );
}
