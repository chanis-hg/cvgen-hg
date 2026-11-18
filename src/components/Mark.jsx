/**
 * The Wura W.
 *
 * Inline rather than an <img> so it inherits `currentColor` — the same mark
 * sits in ink on the cream header, in cream on the dark band, and in the
 * accent on a hover state, without a second file for each.
 */
export default function Mark({ size = 28, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6 12 H18 L24 38 L30 12 H34 L40 38 L46 12 H58 L47 52 H35 L32 38 L29 52 H17 Z"
        fill="currentColor"
      />
    </svg>
  );
}
