import { describe, expect, it } from "vitest";

import {
  INSTAGRAM_INTERVAL_MINUTES,
  dueSources,
  parseItem,
  shortcodeTime,
} from "../packages/feeds/src/index";
import type { Source } from "../packages/feeds/src/index";

describe("shortcodeTime", () => {
  // Image posts land within a few seconds of the page time. A reel can land up to a minute before it.
  const pages: [string, string][] = [
    ["DcepzLhTqxC", "2026-08-25T21:56:15Z"],
    ["Db_OODPzziJ", "2026-08-13T16:58:48Z"],
    ["DZgl5bGzYMM", "2026-06-13T02:26:26Z"],
    ["DY_GpEhTmCo", "2026-05-31T02:18:23Z"],
    ["DYumc3zTiek", "2026-05-24T16:29:15Z"],
    ["DXxvNhBk3-v", "2026-05-01T01:12:07Z"],
    ["DeAFAiLjZkk", "2026-10-02T18:00:17Z"],
    ["Dd99xqDFWAn", "2026-10-01T22:18:36Z"],
    ["Dd7D7GuFWR-", "2026-09-30T19:14:36Z"],
    ["DdY75UNxBy3", "2026-09-17T13:10:20Z"],
    ["DchZswqkYf2", "2026-08-26T23:33:14Z"],
    ["DcMzAz3ERi8", "2026-08-18T23:30:22Z"],
    ["DagRYsKJhH4", "2026-07-07T19:58:37Z"],
    ["DZxuJHYEWca", "2026-06-19T18:05:32Z"],
    ["DZGqIafRVw0", "2026-06-03T00:43:11Z"],
    ["DeAL9c0FNDL", "2026-10-02T19:01:52Z"],
    ["Dd_we7NH1cN", "2026-10-02T15:01:35Z"],
    ["Dd9SkkWjRcu", "2026-10-01T16:01:38Z"],
  ];

  it.each(pages)("decodes %s to within a minute before the page time %s", (code, page) => {
    const lag = (Date.parse(page) - shortcodeTime(code).getTime()) / 1000;

    expect(lag).toBeGreaterThan(-2);
    expect(lag).toBeLessThan(60);
  });

  it("rejects a character outside the alphabet", () => {
    expect(() => shortcodeTime("Dd*pzLhTqxC")).toThrow("código inválido");
  });
});

const title = (description: string) =>
  parseItem({ guid: "x", link: "l", author: "cuenta", description }, "instagram").title;

describe("instagram titles", () => {
  it("takes the first line", () => {
    expect(title("\n  Charla de física \n\nMás detalles")).toBe("Charla de física");
  });

  it("ends a long line at its last sentence end", () => {
    const first = "Se abrió la convocatoria para la beca de maestría en física.";
    const rest =
      " Los requisitos y los plazos están publicados en el enlace de la biografía de la cuenta.";

    expect(title(first + rest)).toBe(first);
  });

  it("ends a long line without a sentence at a word and adds an ellipsis", () => {
    const text = "palabra ".repeat(30).trim();
    const result = title(text);

    expect(result).toMatch(/palabra…$/u);
    expect(result.length).toBeLessThanOrEqual(121);
  });

  it("cuts a long line with no spaces without splitting an emoji", () => {
    expect(title("🔭".repeat(200))).toBe(`${"🔭".repeat(120)}…`);
  });
});

const at = (hour: number, minute: number) => Date.UTC(2026, 9, 4, hour, minute);

describe("dueSources", () => {
  const feed = { id: 1, name: "CERN", url: "u", kind: "feed", parser: null, category: null };
  const instagram = { ...feed, id: 2, name: "@uni_oficial", kind: "instagram" } as Source;
  const sources = [feed as Source, instagram];
  it("asks Instagram once an interval and a feed on every run", () => {
    const runs = Array.from({ length: 24 }, (_, i) => at(10, i * 15)).map(
      (time) => dueSources(sources, time).length,
    );

    expect(runs.filter((count) => count === 2)).toHaveLength(
      24 / (INSTAGRAM_INTERVAL_MINUTES / 15),
    );
    expect(runs.filter((count) => count === 1)).toHaveLength(
      24 - 24 / (INSTAGRAM_INTERVAL_MINUTES / 15),
    );
  });

  it("does not ask Instagram on a quarter past", () => {
    expect(dueSources(sources, at(10, 0))).toContain(instagram);
    expect(dueSources(sources, at(10, 15))).toEqual([feed]);
  });
});
