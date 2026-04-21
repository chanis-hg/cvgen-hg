import { THEMES } from "../i18n";

const LEVEL_WIDTH = { 0: "25%", 1: "50%", 2: "75%", 3: "100%" };

export default function CVPreview({ data, T, theme, id }) {
  const colors = THEMES[theme];

  const sectionTitle = (label) => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "18px 0 10px" }}>
      <div style={{ width: "28px", height: "3px", background: colors.accent, borderRadius: "2px", flexShrink: 0 }} />
      <h3 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.primary, margin: 0 }}>{label}</h3>
    </div>
  );

  return (
    <div id={id} style={{ background: "#fff", fontFamily: "'Georgia', serif", fontSize: "12px", color: "#222", lineHeight: 1.6, minHeight: "297mm", width: "210mm", margin: "0 auto", boxShadow: "0 4px 32px rgba(0,0,0,0.18)" }}>

      {/* Header */}
      <div style={{ background: colors.primary, color: "#fff", padding: "28px 32px", display: "flex", alignItems: "center", gap: "20px" }}>
        {data.photo && (
          <img src={data.photo} alt="photo" style={{ width: "72px", height: "72px", borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.3)", flexShrink: 0 }} />
        )}
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 4px", fontFamily: "'Arial', sans-serif", letterSpacing: "0.02em" }}>
            {data.firstName || T.firstNamePh} {data.lastName || T.lastNamePh}
          </h1>
          <p style={{ fontSize: "13px", margin: "0 0 8px", opacity: 0.85, fontFamily: "'Arial', sans-serif" }}>
            {data.jobTitle || T.jobTitlePh}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "11px", opacity: 0.8, fontFamily: "'Arial', sans-serif" }}>
            {data.email && <span>✉ {data.email}</span>}
            {data.phone && <span>✆ {data.phone}</span>}
            {data.location && <span>⌖ {data.location}</span>}
            {data.linkedin && <span>in {data.linkedin}</span>}
            {data.github && <span>⌥ {data.github}</span>}
          </div>
        </div>
      </div>

      <div style={{ padding: "4px 32px 32px" }}>

        {/* Summary */}
        {data.summary && (
          <>
            {sectionTitle(T.cvSummary)}
            <p style={{ fontSize: "12px", color: "#444", margin: 0, fontStyle: "italic" }}>{data.summary}</p>
          </>
        )}

        {/* Skills */}
        {data.skills?.length > 0 && (
          <>
            {sectionTitle(T.cvSkills)}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px" }}>
              {data.skills.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", minWidth: "90px", color: "#333" }}>{s.name}</span>
                  <div style={{ flex: 1, height: "4px", background: "#E8E8E8", borderRadius: "2px" }}>
                    <div style={{ width: LEVEL_WIDTH[s.level] || "50%", height: "100%", background: colors.accent, borderRadius: "2px" }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Experience */}
        {data.experiences?.length > 0 && (
          <>
            {sectionTitle(T.cvExp)}
            {data.experiences.map((e, i) => (
              <div key={i} style={{ marginBottom: "14px", paddingLeft: "12px", borderLeft: `2px solid ${colors.light}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontWeight: 700, margin: "0 0 2px", fontSize: "13px", color: colors.primary, fontFamily: "'Arial', sans-serif" }}>{e.position}</p>
                    <p style={{ margin: "0 0 4px", color: colors.accent, fontSize: "12px", fontFamily: "'Arial', sans-serif" }}>{e.company}</p>
                  </div>
                  <p style={{ fontSize: "11px", color: "#888", margin: 0, whiteSpace: "nowrap", fontFamily: "'Arial', sans-serif" }}>
                    {e.startDate} — {e.current ? T.present : e.endDate}
                  </p>
                </div>
                {e.description && <p style={{ margin: 0, color: "#555", fontSize: "12px" }}>{e.description}</p>}
              </div>
            ))}
          </>
        )}

        {/* Education */}
        {data.education?.length > 0 && (
          <>
            {sectionTitle(T.cvEdu)}
            {data.education.map((e, i) => (
              <div key={i} style={{ marginBottom: "10px", paddingLeft: "12px", borderLeft: `2px solid ${colors.light}` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontWeight: 700, margin: "0 0 2px", fontSize: "13px", color: colors.primary, fontFamily: "'Arial', sans-serif" }}>{e.degree}</p>
                    <p style={{ margin: 0, color: colors.accent, fontSize: "12px", fontFamily: "'Arial', sans-serif" }}>{e.school}</p>
                  </div>
                  <p style={{ fontSize: "11px", color: "#888", margin: 0, fontFamily: "'Arial', sans-serif" }}>
                    {e.startDate} — {e.current ? T.present : e.endDate}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
