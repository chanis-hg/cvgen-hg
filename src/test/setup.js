import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
/**
 * Node 26 ships its own `localStorage` global that stays undefined unless the
 * runtime is started with --localstorage-file, and its getter wins over the
 * one jsdom would install. The result: every test touching storage failed on
 * Node 26 while the build itself was fine.
 *
 * Rather than pin the whole project to an older runtime, the suite brings its
 * own storage when the environment has none. It is a few lines, it behaves
 * exactly like the real thing for what the app uses, and it makes the tests
 * independent of an experimental Node global.
 */
function memoryStorage() {
  let map = new Map();
  return {
    get length() {
      return map.size;
    },
    key: (i) => [...map.keys()][i] ?? null,
    getItem: (k) => (map.has(String(k)) ? map.get(String(k)) : null),
    setItem: (k, v) => void map.set(String(k), String(v)),
    removeItem: (k) => void map.delete(String(k)),
    clear: () => void (map = new Map()),
  };
}

if (!globalThis.localStorage) {
  const store = memoryStorage();
  for (const target of [globalThis, globalThis.window].filter(Boolean)) {
    Object.defineProperty(target, "localStorage", {
      value: store,
      configurable: true,
      writable: true,
    });
  }
}

globalThis.ResizeObserver = globalThis.ResizeObserver || ResizeObserverStub;
globalThis.requestAnimationFrame = globalThis.requestAnimationFrame || ((cb) => setTimeout(cb, 0));
globalThis.cancelAnimationFrame = globalThis.cancelAnimationFrame || clearTimeout;

afterEach(() => {
  cleanup();
  // Node 26 ships a built-in `localStorage` global that is unavailable unless
  // the runtime is started with --localstorage-file, and it shadows the one
  // jsdom provides. Reaching for it blindly made every test fail on that
  // version while the build itself was fine.
  globalThis.localStorage?.clear?.();
  window.location.hash = "";
  document.getElementById("print-root")?.remove();
});

Object.defineProperty(navigator, "languages", { value: ["fr-FR", "fr"], configurable: true });
