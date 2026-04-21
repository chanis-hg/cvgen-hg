import { useState, useEffect } from "react";

const C = {
  dark: "#0F0F0F", gold: "#D4A853", text: "#E8E3D8",
  textMuted: "#9A9490", border: "#252525", muted: "#6B6B6B",
};

function TypeWriter({ text, speed = 60, onDone }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        onDone && onDone();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayed}
      <span style={{ borderRight: `2px solid ${C.gold}`, marginLeft: "2px", animation: "blink 0.8s step-end infinite" }} />
    </span>
  );
}

export default function Landing({ onStart, lang, setLang, T }) {
  const [phase, setPhase] = useState(0);
  // phase 0: typing title, 1: show tagline, 2: show rest

  return (
    <div style={{ minHeight: "100vh", background: C.dark, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Bebas+Neue&display=swap');
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .fade-in { animation: fadeIn 0.5s ease forwards; }
      `}</style>

      {/* Background grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${C.border} 1px, transparent 1px), linear-gradient(90deg, ${C.border} 1px, transparent 1px)`, backgroundSize: "40px 40px", opacity: 0.4 }} />

      {/* Lang toggle */}
      <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem", display: "flex", gap: "6px" }}>
        {["fr", "en"].map(l => (
          <button key={l} onClick={() => setLang(l)} style={{
            padding: "4px 10px", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase",
            background: lang === l ? C.gold : "transparent", color: lang === l ? C.dark : C.textMuted,
            border: `1px solid ${lang === l ? C.gold : C.border}`, borderRadius: "2px",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>{l}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ position: "relative", textAlign: "center", maxWidth: "600px" }}>

        {/* Badge */}
        <div className="fade-in" style={{ display: "inline-block", padding: "4px 14px", border: `1px solid ${C.border}`, borderRadius: "2px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: "2rem" }}>
          ✦ Pro Resume Builder
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(52px, 10vw, 88px)", letterSpacing: "0.08em", color: C.gold, margin: "0 0 1.5rem", lineHeight: 1 }}>
          <TypeWriter text={T.landingTitle} speed={80} onDone={() => setPhase(1)} />
        </h1>

        {/* Tagline */}
        {phase >= 1 && (
          <p className="fade-up" style={{ fontSize: "clamp(16px, 2.5vw, 20px)", color: C.text, margin: "0 0 1rem", fontWeight: 300, animationDelay: "0.1s", opacity: 0 }}>
            {T.landingTagline}
          </p>
        )}

        {/* Desc */}
        {phase >= 1 && (
          <p className="fade-up" style={{ fontSize: "14px", color: C.textMuted, margin: "0 0 2.5rem", animationDelay: "0.3s", opacity: 0 }}>
            {T.landingDesc}
          </p>
        )}

        {/* Features */}
        {phase >= 1 && (
          <div className="fade-up" style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", marginBottom: "2.5rem", animationDelay: "0.5s", opacity: 0 }}>
            {T.landingFeatures.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: C.textMuted }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: C.gold }} />
                {f}
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        {phase >= 1 && (
          <div className="fade-up" style={{ animationDelay: "0.7s", opacity: 0 }}>
            <button onClick={onStart} style={{
              padding: "14px 36px", fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase",
              background: C.gold, color: C.dark, border: "none", borderRadius: "2px",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              transition: "opacity 0.2s, transform 0.2s",
            }}
              onMouseEnter={e => { e.target.style.opacity = "0.85"; e.target.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.target.style.opacity = "1"; e.target.style.transform = "translateY(0)"; }}>
              {T.landingCta}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <p style={{ position: "absolute", bottom: "1.5rem", fontSize: "11px", color: C.muted, letterSpacing: "0.08em" }}>
        by Gaïus Chanis HONTONWAKOU
      </p>
    </div>
  );
}
