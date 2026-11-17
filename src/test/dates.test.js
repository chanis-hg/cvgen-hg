import { describe, expect, it } from "vitest";
import {
  FUTURE_YEARS,
  MIN_YEAR,
  formatMonthYear,
  isMonthYear,
  monthsBetween,
  normalizeDate,
  parseMonthYear,
  yearOptions,
} from "../lib/dates";

describe("parseMonthYear", () => {
  it("reads the canonical form", () => {
    expect(parseMonthYear("07/2025")).toEqual({ month: "07", year: "2025" });
  });
  it("accepts the separators and the single digit a person may have typed", () => {
    expect(parseMonthYear("7-2025")).toEqual({ month: "07", year: "2025" });
    expect(parseMonthYear("7.2025")).toEqual({ month: "07", year: "2025" });
    expect(parseMonthYear(" 9 / 2025 ")).toEqual({ month: "09", year: "2025" });
  });
  it("accepts the reversed order", () => {
    expect(parseMonthYear("2025-07")).toEqual({ month: "07", year: "2025" });
  });
  it("accepts a year on its own", () => {
    expect(parseMonthYear("2023")).toEqual({ month: "", year: "2023" });
  });
  it("rejects an impossible month", () => {
    expect(parseMonthYear("13/2025")).toEqual({ month: "", year: "" });
    expect(parseMonthYear("00/2025")).toEqual({ month: "", year: "" });
  });
  it("gives up on free text instead of guessing", () => {
    expect(parseMonthYear("juillet 2025")).toEqual({ month: "", year: "" });
    expect(parseMonthYear("")).toEqual({ month: "", year: "" });
    expect(parseMonthYear(undefined)).toEqual({ month: "", year: "" });
  });
});

describe("formatMonthYear", () => {
  it("writes MM/YYYY, or the year alone", () => {
    expect(formatMonthYear("07", "2025")).toBe("07/2025");
    expect(formatMonthYear("", "2025")).toBe("2025");
  });
  it("writes nothing without a year", () => {
    expect(formatMonthYear("07", "")).toBe("");
    expect(formatMonthYear("", "")).toBe("");
  });
});

describe("normalizeDate", () => {
  it("rewrites what it understands", () => {
    expect(normalizeDate("7/2025")).toBe("07/2025");
    expect(normalizeDate("2025-07")).toBe("07/2025");
  });
  it("keeps an older free-text value rather than dropping a date", () => {
    expect(normalizeDate("juillet 2025")).toBe("juillet 2025");
  });
  it("trims to empty", () => {
    expect(normalizeDate("   ")).toBe("");
    expect(normalizeDate(null)).toBe("");
  });
});

describe("isMonthYear", () => {
  it("treats empty and canonical values as fine", () => {
    expect(isMonthYear("")).toBe(true);
    expect(isMonthYear("07/2025")).toBe(true);
    expect(isMonthYear("2025")).toBe(true);
  });
  it("flags what the selects cannot show", () => {
    expect(isMonthYear("juillet 2025")).toBe(false);
  });
});

describe("yearOptions", () => {
  it("runs from a few years ahead down to MIN_YEAR, most recent first", () => {
    const years = yearOptions(new Date("2026-01-01T00:00:00Z"));
    expect(years[0]).toBe(String(2026 + FUTURE_YEARS));
    expect(years.at(-1)).toBe(String(MIN_YEAR));
    expect(years).toContain("2026");
  });
});

describe("monthsBetween", () => {
  it("counts an inclusive span", () => {
    expect(monthsBetween("07/2025", "09/2025")).toBe(3);
    expect(monthsBetween("01/2024", "01/2025")).toBe(13);
  });
  it("returns null when an end is unusable or backwards", () => {
    expect(monthsBetween("09/2025", "07/2025")).toBeNull();
    expect(monthsBetween("juillet", "09/2025")).toBeNull();
    expect(monthsBetween("07/2025", "")).toBeNull();
  });
});
