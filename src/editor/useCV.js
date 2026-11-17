import { useCallback, useEffect, useRef, useState } from "react";
import { EMPTY_DATA, clearState, defaultSettings, loadState, normalizeData, saveState } from "../data/model";

const SAVE_DELAY = 350;

export function useCV() {
  const initial = useRef(null);
  if (initial.current === null) initial.current = loadState();
  const [data, setData] = useState(initial.current?.data ?? EMPTY_DATA);
  const [settings, setSettings] = useState(() => initial.current?.settings ?? defaultSettings());
  const [saveStatus, setSaveStatus] = useState(initial.current ? "saved" : "idle");
  const [hasSaved, setHasSaved] = useState(Boolean(initial.current));
  const timer = useRef(0);
  const pending = useRef(null);
  const afterReset = useRef(null);
  const firstRun = useRef(true);

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    if (!pending.current) return;
    const { data: nextData, settings: nextSettings } = pending.current;
    pending.current = null;
    const ok = saveState(nextData, nextSettings);
    setSaveStatus(ok ? "saved" : "error");
    if (ok) setHasSaved(true);
  }, []);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const reset = afterReset.current;
    if (reset && reset.data === data && reset.settings === settings) return;
    afterReset.current = null;
    pending.current = { data, settings };
    setSaveStatus("saving");
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, SAVE_DELAY);
  }, [data, settings, flush]);

  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onHidden);
      clearTimeout(timer.current);
    };
  }, [flush]);

  const setField = useCallback((key, value) => setData((d) => ({ ...d, [key]: value })), []);
  const patchSettings = useCallback((patch) => setSettings((s) => ({ ...s, ...patch })), []);
  const replaceAll = useCallback((next) => {
    setData(normalizeData(next.data));
    setSettings(next.settings);
  }, []);
  const reset = useCallback(() => {
    clearTimeout(timer.current);
    pending.current = null;
    const cleared = clearState();
    const next = { ...defaultSettings(), lang: settings.lang };
    afterReset.current = { data: EMPTY_DATA, settings: next };
    setData(EMPTY_DATA);
    setSettings(next);
    setSaveStatus(cleared ? "idle" : "error");
    setHasSaved(false);
  }, [settings.lang]);

  return { data, settings, setField, patchSettings, replaceAll, reset, saveStatus, hasSaved };
}
