import { describe, expect, it } from "vitest";
import { daysUntil, formatLongDate, getPlanWeek, todayInLisbon } from "../src/lib/date";

describe("Europe/Lisbon calendar", () => {
  it("keeps the Lisbon date around UTC midnight", () => {
    expect(todayInLisbon(new Date("2026-08-10T23:30:00Z"))).toBe("2026-08-11");
  });

  it("formats display dates in English", () => {
    expect(formatLongDate("2026-08-10")).toBe("Monday 10 August");
  });

  it("calculates the block week and clamps dates outside the interval", () => {
    expect(getPlanWeek("2026-08-10")).toBe(1);
    expect(getPlanWeek("2026-08-31")).toBe(4);
    expect(getPlanWeek("2027-01-01")).toBe(12);
    expect(getPlanWeek("2026-08-01")).toBe(1);
  });

  it("calculates countdowns without negative values", () => {
    expect(daysUntil("2027-04-03", "2026-08-10")).toBe(236);
    expect(daysUntil("2026-08-01", "2026-08-10")).toBe(0);
  });
});
