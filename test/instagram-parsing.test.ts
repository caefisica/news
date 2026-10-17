import { describe, expect, it } from "vitest";

import { dueSources, parseItem, shortcodeTime } from "../packages/feeds/src/index";
import type { Source } from "../packages/feeds/src/index";

describe("shortcodeTime", () => {
  // Image posts land within a few seconds of the page time. A reel can land up to a minute before it.
  const pages: [string, string][] = [
    ["DcepzLhTqxC", "2026-08-25T21:56:15Z"],
    ["Db_OODPzziJ", "2026-08-13T16:58:48Z"],
    ["DXxvNhBk3-v", "2026-05-01T01:12:07Z"],
    ["Dd7D7GuFWR-", "2026-09-30T19:14:36Z"],
    ["DeAL9c0FNDL", "2026-10-02T19:01:52Z"],
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

describe("dueSources", () => {
  const feed = { id: 1, name: "CERN", url: "u", kind: "feed", parser: null, category: null };
  const instagram = { ...feed, id: 2, name: "@uni_oficial", kind: "instagram" } as Source;
  const sources = [feed as Source, instagram];

  it.each([
    { minute: 0, due: [feed, instagram] },
    { minute: 15, due: [feed] },
    { minute: 30, due: [feed] },
    { minute: 45, due: [feed] },
  ])("at minute $minute of the hour", ({ minute, due }) => {
    expect(dueSources(sources, Date.UTC(2026, 9, 4, 10, minute))).toEqual(due);
  });
});
