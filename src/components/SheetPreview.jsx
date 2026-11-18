import { useEffect, useRef, useState } from "react";
import CVSheet from "./CVSheet";

const PAGE_W = 794;
const PAGE_H = 1123;

/**
 * A real CV sheet, shrunk to whatever width it is given.
 *
 * The gallery used to show hand-drawn grey blocks standing in for a layout.
 * They drifted from the templates they described, and nobody could tell what
 * a finished CV would look like. This renders the actual component instead,
 * so the preview cannot be wrong: it is the thing itself.
 *
 * It is inert and hidden from assistive technology on purpose. The card
 * around it carries the name, the description and the buttons; the miniature
 * is a picture, and its links must not become keyboard stops.
 */
export default function SheetPreview({
  data,
  templateId,
  region,
  cvLang,
  accent,
  density,
  layout,
  titleStyle,
  skillStyle,
  pages = 1,
}) {
  const outer = useRef(null);
  const [scale, setScale] = useState(0.35);

  useEffect(() => {
    const node = outer.current;
    if (!node) return;
    const update = () => setScale(node.clientWidth / PAGE_W);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={outer}
      inert=""
      aria-hidden="true"
      style={{
        width: "100%",
        minWidth: 0,
        height: PAGE_H * pages * scale,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <div style={{ width: PAGE_W, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <CVSheet
          data={data}
          templateId={templateId}
          region={region}
          cvLang={cvLang}
          accent={accent}
          density={density}
          layout={layout}
          titleStyle={titleStyle}
          skillStyle={skillStyle}
        />
      </div>
    </div>
  );
}
