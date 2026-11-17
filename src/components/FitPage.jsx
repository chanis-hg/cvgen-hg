import { useEffect, useRef, useState } from "react";

const PAGE_W = 794;
const PAGE_H = 1123;

/**
 * Shows an A4 page at whatever size the panel allows.
 *
 * `zoom="fit"` scales the sheet down to the available width — on a 390 px
 * phone that lands around 44 %, fine for checking the overall shape but too
 * small to proofread. `zoom="full"` renders it at 1:1 and lets the container
 * scroll sideways, which is what someone re-reading their own wording needs.
 */
export default function FitPage({ children, zoom = "fit" }) {
  const outer = useRef(null);
  const inner = useRef(null);
  const [fit, setFit] = useState(1);
  const [height, setHeight] = useState(PAGE_H);

  useEffect(() => {
    const update = () => {
      if (!outer.current || !inner.current) return;
      setFit(Math.min(1, outer.current.clientWidth / PAGE_W));
      setHeight(Math.max(PAGE_H, inner.current.offsetHeight));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(outer.current);
    observer.observe(inner.current);
    return () => observer.disconnect();
  }, []);

  const scale = zoom === "full" ? 1 : fit;

  return (
    // keyed on the prop, not on the measured scale: deriving it from `fit`
    // let the panel widen, which raised `fit`, which switched scrolling back
    // off — the page grew instead of the preview scrolling inside it.
    <div ref={outer} style={{ width: "100%", overflowX: zoom === "full" ? "auto" : "visible" }}>
      <div style={{ height: height * scale, width: PAGE_W * scale, margin: "0 auto" }}>
        <div ref={inner} style={{ width: PAGE_W, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
