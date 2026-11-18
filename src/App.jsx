import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { I18nProvider } from "./i18n";
import { useCV } from "./editor/useCV";
import Landing from "./components/Landing";
import { useTheme } from "./theme";
import { getTemplate } from "./data/templates";
import { SAMPLE_ACCENTS, SAMPLE_LAYOUTS, SAMPLE_SKILL_STYLES, SAMPLE_TITLE_STYLES } from "./data/samples";

const Editor = lazy(() => import("./editor/Editor"));
const TemplatePicker = lazy(() => import("./components/TemplatePicker"));

const ROUTES = ["home", "models", "editor"];

function readRoute() {
  const name = window.location.hash.replace(/^#\/?/, "");
  return ROUTES.includes(name) ? name : "home";
}

export function useRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const onChange = () => {
      setRoute(readRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  const navigate = useCallback((name) => {
    window.location.hash = name === "home" ? "" : `/${name}`;
  }, []);
  return [route, navigate];
}

export default function App() {
  const cv = useCV();
  const [route, navigate] = useRoute();
  const { settings, patchSettings } = cv;

  useEffect(() => {
    document.documentElement.lang = settings.lang;
  }, [settings.lang]);

  // Picking a model brings its layout with it, otherwise someone who chose
  // the dark-column card in the gallery would land on a plain single column
  // and wonder where the design went. Both stay changeable afterwards.
  const pick = (id) => {
    patchSettings({ template: id, layout: getTemplate(id).defaultLayout });
    navigate("editor");
  };

  // Starting from a sample hands over the layout AND the wording. The editor
  // opens on the first step so the very next thing the person sees is their
  // own name replacing the example's.
  const useSample = (id, data) => {
    cv.replaceAll({
      data,
      settings: {
        ...settings,
        template: id,
        layout: SAMPLE_LAYOUTS[id] ?? getTemplate(id).defaultLayout,
        accent: SAMPLE_ACCENTS[id] ?? settings.accent,
        titleStyle: SAMPLE_TITLE_STYLES[id] ?? settings.titleStyle,
        skillStyle: SAMPLE_SKILL_STYLES[id] ?? settings.skillStyle,
        step: 0,
      },
    });
    navigate("editor");
  };

  const { theme, toggle: toggleTheme } = useTheme();

  let view;
  if (route === "models") {
    view = (
      <TemplatePicker
        current={settings.template}
        onPick={pick}
        onUseSample={useSample}
        navigate={navigate}
        hasSaved={cv.hasSaved}
        region={settings.region}
        cvLang={settings.cvLang}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  } else if (route === "editor") {
    view = <Editor cv={cv} navigate={navigate} theme={theme} onToggleTheme={toggleTheme} />;
  } else {
    view = (
      <Landing
        navigate={navigate}
        lang={settings.lang}
        onLang={(l) => patchSettings({ lang: l })}
        hasSaved={cv.hasSaved}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <I18nProvider lang={settings.lang}>
      <Suspense fallback={<p style={{ padding: 24 }}>...</p>}>{view}</Suspense>
    </I18nProvider>
  );
}
