import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { STORAGE_KEY } from "../data/model";
import { useCV } from "../editor/useCV";

describe("useCV saving", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const stored = () => localStorage.getItem(STORAGE_KEY);

  it("starts idle when nothing is saved", () => {
    const { result } = renderHook(() => useCV());
    expect(result.current.saveStatus).toBe("idle");
    expect(result.current.hasSaved).toBe(false);
  });

  it("shows saving first, then saved once the write succeeded", () => {
    const { result } = renderHook(() => useCV());
    act(() => result.current.setField("firstName", "Aïcha"));
    expect(result.current.saveStatus).toBe("saving");
    expect(stored()).toBeNull();
    act(() => vi.advanceTimersByTime(350));
    expect(result.current.saveStatus).toBe("saved");
    expect(stored()).toContain("Aïcha");
    expect(result.current.hasSaved).toBe(true);
  });

  it("saves immediately when the page is hidden", () => {
    const { result } = renderHook(() => useCV());
    act(() => result.current.setField("firstName", "Aïcha"));
    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });
    expect(stored()).toContain("Aïcha");
    expect(result.current.saveStatus).toBe("saved");
  });

  it("reports an error when the browser refuses the write", () => {
    // Swap the storage out rather than spying on it: jsdom wraps localStorage
    // in a proxy, and on Node 26 the suite supplies a plain object that
    // inherits from no Storage class, so neither spy target works on both.
    const real = globalThis.localStorage;
    const refusing = {
      getItem: (k) => real.getItem(k),
      setItem: () => {
        throw new Error("full");
      },
      removeItem: (k) => real.removeItem(k),
      clear: () => real.clear(),
    };
    Object.defineProperty(globalThis, "localStorage", {
      value: refusing,
      configurable: true,
      writable: true,
    });
    try {
      const { result } = renderHook(() => useCV());
      act(() => result.current.setField("firstName", "Aïcha"));
      act(() => vi.advanceTimersByTime(350));
      expect(result.current.saveStatus).toBe("error");
      expect(result.current.hasSaved).toBe(false);
    } finally {
      Object.defineProperty(globalThis, "localStorage", {
        value: real,
        configurable: true,
        writable: true,
      });
    }
  });

  it("erases the stored CV at once and cancels a pending save", () => {
    const { result } = renderHook(() => useCV());
    act(() => result.current.setField("firstName", "Aïcha"));
    act(() => vi.advanceTimersByTime(350));
    act(() => result.current.setField("lastName", "DOSSOU"));
    act(() => result.current.reset());
    expect(stored()).toBeNull();
    act(() => vi.advanceTimersByTime(1000));
    expect(stored()).toBeNull();
    expect(result.current.data.firstName).toBe("");
    expect(result.current.saveStatus).toBe("idle");
    expect(result.current.hasSaved).toBe(false);
  });

  it("does not bring data back when the page is hidden after an erase", () => {
    const { result } = renderHook(() => useCV());
    act(() => result.current.setField("firstName", "Aïcha"));
    act(() => result.current.reset());
    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });
    expect(stored()).toBeNull();
  });

  it("saves again when the user edits after an erase", () => {
    const { result } = renderHook(() => useCV());
    act(() => result.current.setField("firstName", "Aïcha"));
    act(() => vi.advanceTimersByTime(350));
    act(() => result.current.reset());
    act(() => result.current.setField("firstName", "Marie"));
    act(() => vi.advanceTimersByTime(350));
    expect(stored()).toContain("Marie");
    expect(result.current.saveStatus).toBe("saved");
  });
});
