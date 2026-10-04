import { describe, expect, it } from "vitest";

import { groupByDay, isValidTimestamp, longDate, shortDate } from "~/utils/dates";

// Friday 2 October 2026, 10:00 in Lima (UTC-5).
const now = new Date("2026-10-02T15:00:00Z");
const lima = (iso: string) => Date.parse(`${iso}-05:00`) / 1000;

describe("isValidTimestamp", () => {
  it("accepts seconds that Date can format", () => {
    expect(isValidTimestamp(lima("2026-10-02T09:00:00"))).toBe(true);
    expect(isValidTimestamp(0)).toBe(true);
  });

  it("rejects values Date cannot format", () => {
    for (const value of [Number.MAX_VALUE, Infinity, -Infinity, NaN, 8.64e12 + 1, "1", null]) {
      expect(isValidTimestamp(value)).toBe(false);
    }
  });
});

describe("groupByDay", () => {
  it("puts articles under Hoy, Ayer, Esta semana and month headings", () => {
    const items = [
      { id: 1, published_at: lima("2026-10-02T08:00:00") },
      { id: 2, published_at: lima("2026-10-02T00:30:00") },
      { id: 3, published_at: lima("2026-10-01T23:30:00") },
      { id: 4, published_at: lima("2026-09-28T12:00:00") },
      { id: 5, published_at: lima("2026-09-27T12:00:00") },
      { id: 6, published_at: lima("2026-08-10T12:00:00") },
      { id: 7, published_at: null },
    ];
    const groups = groupByDay(items, now);
    expect(groups.map((group) => [group.label, group.items.map((item) => item.id)])).toEqual([
      ["Hoy", [1, 2]],
      ["Ayer", [3]],
      ["Esta semana", [4]],
      // Peruvian Spanish spells the month «setiembre».
      ["Setiembre de 2026", [5]],
      ["Agosto de 2026", [6]],
      ["Sin fecha", [7]],
    ]);
  });

  it("gives every group a key that is a valid id", () => {
    const groups = groupByDay([{ published_at: lima("2026-08-10T12:00:00") }], now);
    expect(groups[0]?.key).toBe("month-2026-08");
  });
});

describe("shortDate", () => {
  it("shows the time today, the weekday this week and the day before that", () => {
    expect(shortDate(lima("2026-10-02T08:05:00"), now)).toBe("08:05");
    expect(shortDate(lima("2026-09-28T12:00:00"), now)).toMatch(/^lun/u);
    expect(shortDate(lima("2026-08-10T12:00:00"), now)).toMatch(/^10 ago/u);
  });

  it("returns null for a timestamp it cannot format", () => {
    expect(shortDate(Number.MAX_VALUE, now)).toBeNull();
    expect(longDate(Number.MAX_VALUE)).toBeNull();
  });
});
