import { useState, useRef } from "react";
import { t, THEMES } from "./i18n";
import CVPreview from "./components/CVPreview";
import Landing from "./components/Landing";

const C = {
  dark: "#0F0F0F", card: "#161616", border: "#252525",
  gold: "#D4A853", text: "#E8E3D8", textMuted: "#9A9490", muted: "#6B6B6B",
};

const EMPTY_DATA = {
  firstName: "", lastName: "", jobTitle: "", email: "", phone: "",
  location: "", linkedin: "", github: "", summary: "", photo: null,
  skills: [], experiences: [], education: [],
};

const Input = ({ label, value, onChange, placeholder, type = "text", rows, error, required }) => (
  <div style={{ marginBottom: "14px" }}>
    <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: error ? "#E05252" : C.textMuted, marginBottom: "5px" }}>
      {label}{required && <span style={{ color: "#E05252", marginLeft: "4px" }}>*</span>}
    </label>
    {rows ? (
      <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: "#1A1A1A", border: `1px solid ${error ? "#E05252" : C.border}`, borderRadius: "2px", padding: "8px 10px", color: C.text, fontSize: "13px", fontFamily: "inherit", resize: "vertical", outline: "none" }} />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: "#1A1A1A", border: `1px solid ${error ? "#E05252" : C.border}`, borderRadius: "2px", padding: "8px 10px", color: C.text, fontSize: "13px", fontFamily: "inherit", outline: "none" }} />
    )}
    {error && <p style={{ fontSize: "11px", color: "#E05252", margin: "4px 0 0", letterSpacing: "0.06em" }}>Ce champ est requis</p>}
  </div>
);

const Btn = ({ onClick, children, variant = "primary" }) => (
  <button onClick={onClick} style={{
    padding: "9px 20px", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase",
    background: variant === "primary" ? C.gold : "transparent",
    color: variant === "primary" ? C.dark : C.textMuted,
    border: `1px solid ${variant === "primary" ? C.gold : C.border}`,
    borderRadius: "2px", cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.15s",
  }}>{children}</button>
);

export default function App() {
  const [lang, setLang] = useState("fr");
  const [screen, setScreen] = useState("landing"); // "landing" | "app"
  const [step, setStep] = useState(0);
  const [data, setData] = useState(EMPTY_DATA);
  const [theme, setTheme] = useState("navy");
  const [newSkill, setNewSkill] = useState({ name: "", level: 2 });
  const [newExp, setNewExp] = useState({ company: "", position: "", startDate: "", endDate: "", current: false, description: "" });
  const [newEdu, setNewEdu] = useState({ school: "", degree: "", startDate: "", endDate: "", current: false });
  const [errors, setErrors] = useState({});
  const fileRef = useRef();
  const T = t[lang];

  const set = (key, val) => {
    setData(d => ({ ...d, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: false }));
  };

  const validateStep0 = () => {
    const required = { firstName: data.firstName, lastName: data.lastName, jobTitle: data.jobTitle, email: data.email };
    const newErrors = {};
    Object.entries(required).forEach(([k, v]) => { if (!v.trim()) newErrors[k] = true; });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set("photo", ev.target.result);
    reader.readAsDataURL(file);
  };

  const addSkill = () => {
    if (!newSkill.name.trim()) return;
    set("skills", [...data.skills, { ...newSkill }]);
    setNewSkill({ name: "", level: 2 });
  };

  const addExp = () => {
    if (!newExp.company.trim()) return;
    set("experiences", [...data.experiences, { ...newExp }]);
    setNewExp({ company: "", position: "", startDate: "", endDate: "", current: false, description: "" });
  };

  const addEdu = () => {
    if (!newEdu.school.trim()) return;
    set("education", [...data.education, { ...newEdu }]);
    setNewEdu({ school: "", degree: "", startDate: "", endDate: "", current: false });
  };

  const downloadPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const el = document.getElementById("cv-preview");
    html2pdf().set({
      margin: 0,
      filename: `CV_${data.firstName || "CV"}_${data.lastName || ""}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    }).from(el).save();
  };

  if (screen === "landing") {
    return <Landing onStart={() => setScreen("app")} lang={lang} setLang={setLang} T={T} />;
  }

  const renderStep = () => {
    if (step === 0) return (
      <div>
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}><Input label={T.firstName} value={data.firstName} onChange={v => set("firstName", v)} placeholder={T.firstNamePh} required error={errors.firstName} /></div>
          <div style={{ flex: 1 }}><Input label={T.lastName} value={data.lastName} onChange={v => set("lastName", v)} placeholder={T.lastNamePh} required error={errors.lastName} /></div>
        </div>
        <Input label={T.jobTitle} value={data.jobTitle} onChange={v => set("jobTitle", v)} placeholder={T.jobTitlePh} required error={errors.jobTitle} />
        <Input label={T.email} value={data.email} onChange={v => set("email", v)} type="email" required error={errors.email} />
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}><Input label={T.phone} value={data.phone} onChange={v => set("phone", v)} /></div>
          <div style={{ flex: 1 }}><Input label={T.location} value={data.location} onChange={v => set("location", v)} /></div>
        </div>
        <Input label={T.linkedin} value={data.linkedin} onChange={v => set("linkedin", v)} />
        <Input label={T.github} value={data.github} onChange={v => set("github", v)} />
        <Input label={T.summary} value={data.summary} onChange={v => set("summary", v)} placeholder={T.summaryPlaceholder} rows={3} />
        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: C.textMuted, marginBottom: "8px" }}>{T.photo}</label>
          <div onClick={() => fileRef.current.click()} style={{ width: "80px", height: "80px", borderRadius: "50%", border: `2px dashed ${C.border}`, cursor: "pointer", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#1A1A1A" }}>
            {data.photo
              ? <img src={data.photo} alt="photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: "10px", color: C.muted, textAlign: "center", padding: "4px" }}>{T.photoHint}</span>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
        </div>
      </div>
    );

    if (step === 1) return (
      <div>
        <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
          <input value={newSkill.name} onChange={e => setNewSkill(s => ({ ...s, name: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && addSkill()}
            placeholder={T.skillPlaceholder}
            style={{ flex: 1, background: "#1A1A1A", border: `1px solid ${C.border}`, borderRadius: "2px", padding: "8px 10px", color: C.text, fontSize: "13px", fontFamily: "inherit", outline: "none" }} />
          <select value={newSkill.level} onChange={e => setNewSkill(s => ({ ...s, level: +e.target.value }))}
            style={{ background: "#1A1A1A", border: `1px solid ${C.border}`, borderRadius: "2px", padding: "8px", color: C.text, fontSize: "12px", fontFamily: "inherit", cursor: "pointer" }}>
            {T.levels.map((l, i) => <option key={i} value={i}>{l}</option>)}
          </select>
          <Btn onClick={addSkill}>+</Btn>
        </div>
        {data.skills.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: "#1A1A1A", border: `1px solid ${C.border}`, borderRadius: "2px", marginBottom: "6px" }}>
            <span style={{ flex: 1, fontSize: "13px", color: C.text }}>{s.name}</span>
            <span style={{ fontSize: "11px", color: C.textMuted }}>{T.levels[s.level]}</span>
            <button onClick={() => set("skills", data.skills.filter((_, j) => j !== i))}
              style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: "16px" }}>×</button>
          </div>
        ))}
      </div>
    );

    if (step === 2) return (
      <div>
        <div style={{ background: "#1A1A1A", border: `1px solid ${C.border}`, borderRadius: "2px", padding: "14px", marginBottom: "12px" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}><Input label={T.company} value={newExp.company} onChange={v => setNewExp(e => ({ ...e, company: v }))} /></div>
            <div style={{ flex: 1 }}><Input label={T.position} value={newExp.position} onChange={v => setNewExp(e => ({ ...e, position: v }))} /></div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}><Input label={T.startDate} value={newExp.startDate} onChange={v => setNewExp(e => ({ ...e, startDate: v }))} placeholder="2022" /></div>
            {!newExp.current && <div style={{ flex: 1 }}><Input label={T.endDate} value={newExp.endDate} onChange={v => setNewExp(e => ({ ...e, endDate: v }))} placeholder="2024" /></div>}
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: C.textMuted, cursor: "pointer", marginBottom: "10px" }}>
            <input type="checkbox" checked={newExp.current} onChange={e => setNewExp(x => ({ ...x, current: e.target.checked }))} />
            {T.current}
          </label>
          <Input label={T.description} value={newExp.description} onChange={v => setNewExp(e => ({ ...e, description: v }))} placeholder={T.descPlaceholder} rows={2} />
          <Btn onClick={addExp}>{T.addExp}</Btn>
        </div>
        {data.experiences.map((e, i) => (
          <div key={i} style={{ padding: "10px 14px", background: "#1A1A1A", border: `1px solid ${C.border}`, borderRadius: "2px", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ margin: "0 0 2px", fontWeight: 500, fontSize: "13px", color: C.text }}>{e.position}</p>
              <p style={{ margin: 0, fontSize: "12px", color: C.textMuted }}>{e.company} · {e.startDate} — {e.current ? T.present : e.endDate}</p>
            </div>
            <button onClick={() => set("experiences", data.experiences.filter((_, j) => j !== i))}
              style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: "16px" }}>×</button>
          </div>
        ))}
      </div>
    );

    if (step === 3) return (
      <div>
        <div style={{ background: "#1A1A1A", border: `1px solid ${C.border}`, borderRadius: "2px", padding: "14px", marginBottom: "12px" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}><Input label={T.school} value={newEdu.school} onChange={v => setNewEdu(e => ({ ...e, school: v }))} /></div>
            <div style={{ flex: 1 }}><Input label={T.degree} value={newEdu.degree} onChange={v => setNewEdu(e => ({ ...e, degree: v }))} /></div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}><Input label={T.startDate} value={newEdu.startDate} onChange={v => setNewEdu(e => ({ ...e, startDate: v }))} placeholder="2022" /></div>
            {!newEdu.current && <div style={{ flex: 1 }}><Input label={T.endDate} value={newEdu.endDate} onChange={v => setNewEdu(e => ({ ...e, endDate: v }))} placeholder="2025" /></div>}
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: C.textMuted, cursor: "pointer", marginBottom: "10px" }}>
            <input type="checkbox" checked={newEdu.current} onChange={e => setNewEdu(x => ({ ...x, current: e.target.checked }))} />
            {T.current}
          </label>
          <Btn onClick={addEdu}>{T.addEdu}</Btn>
        </div>
        {data.education.map((e, i) => (
          <div key={i} style={{ padding: "10px 14px", background: "#1A1A1A", border: `1px solid ${C.border}`, borderRadius: "2px", marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: "0 0 2px", fontWeight: 500, fontSize: "13px", color: C.text }}>{e.degree}</p>
              <p style={{ margin: 0, fontSize: "12px", color: C.textMuted }}>{e.school} · {e.startDate} — {e.current ? T.present : e.endDate}</p>
            </div>
            <button onClick={() => set("education", data.education.filter((_, j) => j !== i))}
              style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: "16px" }}>×</button>
          </div>
        ))}
      </div>
    );

    return null;
  };

  return (
    <div style={{ minHeight: "100vh", background: C.dark, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Bebas+Neue&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.dark}; }
        input::placeholder, textarea::placeholder { color: ${C.muted}; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; }
        select option { background: #1A1A1A; }
        @media (max-width: 900px) { .cv-wrap { display: none !important; } .main-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: `1px solid ${C.border}`, padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: C.dark, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => setScreen("landing")} style={{ background: "transparent", border: "none", color: C.textMuted, cursor: "pointer", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "inherit" }}>{T.backHome}</button>
          <span style={{ color: C.border }}>|</span>
          <h1 style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "0.06em", color: C.gold, fontFamily: "'Bebas Neue', sans-serif" }}>{T.appTitle}</h1>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {["fr", "en"].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              padding: "4px 10px", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase",
              background: lang === l ? C.gold : "transparent", color: lang === l ? C.dark : C.textMuted,
              border: `1px solid ${lang === l ? C.gold : C.border}`, borderRadius: "2px",
              cursor: "pointer", fontFamily: "inherit",
            }}>{l}</button>
          ))}
        </div>
      </header>

      <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "420px 1fr", minHeight: "calc(100vh - 57px)" }}>

        {/* Left — Form */}
        <div style={{ borderRight: `1px solid ${C.border}`, padding: "1.5rem", overflowY: "auto", maxHeight: "calc(100vh - 57px)" }}>

          {/* Theme */}
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: C.textMuted, marginBottom: "8px" }}>{T.themeLabel}</p>
            <div style={{ display: "flex", gap: "8px" }}>
              {Object.entries(THEMES).map(([key, val]) => (
                <button key={key} onClick={() => setTheme(key)} title={T.themes[key]} style={{
                  width: "28px", height: "28px", borderRadius: "50%", background: val.primary, cursor: "pointer",
                  border: theme === key ? `2px solid ${C.gold}` : `2px solid transparent`,
                  outline: theme === key ? `2px solid ${C.gold}` : "none", outlineOffset: "2px",
                }} />
              ))}
            </div>
          </div>

          {/* Steps */}
          <div style={{ display: "flex", gap: "4px", marginBottom: "1.5rem" }}>
            {T.steps.map((s, i) => (
              <div key={i} onClick={() => setStep(i)} style={{ flex: 1, cursor: "pointer" }}>
                <div style={{ height: "3px", background: i <= step ? C.gold : C.border, borderRadius: "2px", marginBottom: "4px", transition: "background 0.2s" }} />
                <p style={{ fontSize: "9px", letterSpacing: "0.08em", textTransform: "uppercase", color: i === step ? C.gold : C.muted, textAlign: "center" }}>{s}</p>
              </div>
            ))}
          </div>

          {renderStep()}

          {/* Nav */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem", paddingTop: "1rem", borderTop: `1px solid ${C.border}` }}>
            {step > 0 ? <Btn onClick={() => setStep(s => s - 1)} variant="secondary">{T.prev}</Btn> : <div />}
            {step < 3
              ? <Btn onClick={() => { if (step === 0 && !validateStep0()) return; setStep(s => s + 1); }}>{T.next}</Btn>
              : <Btn onClick={downloadPDF}>{T.download}</Btn>}
          </div>
        </div>

        {/* Right — Preview */}
        <div className="cv-wrap" style={{ overflowY: "auto", maxHeight: "calc(100vh - 57px)", padding: "2rem", background: "#1A1A1A" }}>
          <CVPreview data={data} T={T} theme={theme} id="cv-preview" />
        </div>
      </div>
    </div>
  );
}
