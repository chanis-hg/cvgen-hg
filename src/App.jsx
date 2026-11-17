import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { I18nProvider } from "./i18n";
import { useCV } from "./editor/useCV";
import Landing from "./components/Landing";

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

  const pick = (id) => {
    patchSettings({ template: id });
    navigate("editor");
  };

  let view;
  if (route === "models") {
    view = (
      <TemplatePicker current={settings.template} onPick={pick} navigate={navigate} hasSaved={cv.hasSaved} />
    );
  } else if (route === "editor") {
    view = <Editor cv={cv} navigate={navigate} />;
  } else {
    view = (
      <Landing
        navigate={navigate}
        lang={settings.lang}
        onLang={(l) => patchSettings({ lang: l })}
        hasSaved={cv.hasSaved}
      />
    );
  }

  return (
    <I18nProvider lang={settings.lang}>
      <Suspense fallback={<p style={{ padding: 24 }}>...</p>}>{view}</Suspense>
    </I18nProvider>
  );
}
