import { useI18n } from "../i18n";
import { LAYOUT_IDS, getLayout } from "../data/layouts";
import styles from "./LayoutPicker.module.css";

// Une disposition se choisit avec les yeux. Un nom comme « colonne sombre »
// ne dit rien tant qu'on ne voit pas où tombe la colonne, donc chaque
// vignette dessine la géométrie de la page en miniature, dans la couleur
// que la personne a déjà choisie.
const W = 30;
const H = 40;

function rows(x, width, from, count, gap = 4) {
  return Array.from({ length: count }, (_, i) => (
    <rect key={i} x={x} y={from + i * gap} width={i % 3 === 2 ? width * 0.6 : width} height={1.6} rx={0.8} />
  ));
}

function Thumb({ id }) {
  const layout = getLayout(id);
  const pad = 3.5;
  const inner = W - pad * 2;

  if (layout.col === "two") {
    const sideW = 10;
    const left = layout.side === "left";
    const sideX = left ? 0 : W - sideW;
    const mainX = left ? sideW + 2.5 : pad;
    const mainW = W - sideW - 2.5 - pad;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.thumb} aria-hidden="true">
        <rect x="0" y="0" width={W} height={H} className={styles.paper} />
        <rect
          x={sideX}
          y="0"
          width={sideW}
          height={H}
          className={layout.tone === "dark" ? styles.fill : styles.wash}
        />
        <g className={styles.ink}>
          <rect x={mainX} y={pad + 1} width={mainW * 0.8} height={3.4} rx={1} />
          {rows(mainX, mainW, pad + 8, 7)}
        </g>
        <g className={layout.tone === "dark" ? styles.inkOnFill : styles.ink}>
          {rows(sideX + 2, sideW - 4, pad + 3, 6)}
        </g>
      </svg>
    );
  }

  if (layout.header === "band") {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.thumb} aria-hidden="true">
        <rect x="0" y="0" width={W} height={H} className={styles.paper} />
        <rect x="0" y="0" width={W} height="11" className={styles.fill} />
        <g className={styles.inkOnFill}>
          <rect x={pad} y="3" width={inner * 0.7} height={3.2} rx={1} />
          <rect x={pad} y="7.6" width={inner * 0.45} height={1.6} rx={0.8} />
        </g>
        <g className={styles.ink}>{rows(pad, inner, 15, 6)}</g>
      </svg>
    );
  }

  if (layout.header === "center") {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.thumb} aria-hidden="true">
        <rect x="0" y="0" width={W} height={H} className={styles.paper} />
        <g className={styles.ink}>
          <rect x={W / 2 - inner * 0.33} y={pad + 1} width={inner * 0.66} height={3.4} rx={1} />
          <rect x={W / 2 - inner * 0.2} y={pad + 6} width={inner * 0.4} height={1.6} rx={0.8} />
          <rect x={pad} y={pad + 10.5} width={inner} height={0.9} />
          {rows(pad, inner, pad + 14, 6)}
        </g>
      </svg>
    );
  }

  if (layout.rail) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.thumb} aria-hidden="true">
        <rect x="0" y="0" width={W} height={H} className={styles.paper} />
        <g className={styles.ink}>
          <rect x={pad} y={pad + 1} width={inner * 0.75} height={3.4} rx={1} />
        </g>
        <rect x={pad + 1} y={pad + 8} width="0.9" height={H - pad - 12} className={styles.rail} />
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx={pad + 1.45}
            cy={pad + 10 + i * 8.5}
            r="1.8"
            className={styles.dot}
            strokeWidth="1.1"
          />
        ))}
        <g className={styles.ink}>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={pad + 5} y={pad + 9 + i * 8.5} width={inner - 5} height={1.8} rx={0.9} />
              <rect x={pad + 5} y={pad + 12.5 + i * 8.5} width={(inner - 5) * 0.65} height={1.4} rx={0.7} />
            </g>
          ))}
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.thumb} aria-hidden="true">
      <rect x="0" y="0" width={W} height={H} className={styles.paper} />
      <g className={styles.ink}>
        <rect x={pad} y={pad + 1} width={inner * 0.75} height={3.4} rx={1} />
        <rect x={pad} y={pad + 6} width={inner * 0.45} height={1.6} rx={0.8} />
        <rect x={pad} y={pad + 10.5} width={inner} height={0.9} />
        {rows(pad, inner, pad + 14, 6)}
      </g>
    </svg>
  );
}

export default function LayoutPicker({ value, onChange, accentColor }) {
  const { t } = useI18n();
  return (
    <div className={styles.grid} role="group" aria-label={t("editor.layout")} style={{ "--sw": accentColor }}>
      {LAYOUT_IDS.map((id) => (
        <button
          key={id}
          type="button"
          aria-pressed={value === id}
          onClick={() => onChange(id)}
          className={styles.tile}
          title={t(`layout.${id}`)}
        >
          <Thumb id={id} />
          <span className={styles.srOnly}>{t(`layout.${id}`)}</span>
        </button>
      ))}
    </div>
  );
}
