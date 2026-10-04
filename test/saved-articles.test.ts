import { describe, expect, it } from "vitest";

import { parseSaved } from "~/composables/use-saved-articles";

const article = {
  id: 1,
  title: "Beca de maestría",
  link: "https://example.org/beca",
  description: null,
  author: null,
  published_at: 1_790_000_000,
  source_id: 2,
  source_name: "PRONABEC",
  category: "becas",
};

describe("parseSaved", () => {
  it("keeps valid articles", () => {
    expect(parseSaved(JSON.stringify([article]))).toEqual([article]);
    expect(parseSaved(JSON.stringify([{ ...article, published_at: null }]))).toHaveLength(1);
  });

  it("drops entries whose date cannot be formatted", () => {
    // JSON cannot hold Infinity or NaN; they arrive as out-of-range numbers or strings.
    for (const published_at of [Number.MAX_VALUE, 1e300, -1e20, "1790000000"]) {
      expect(parseSaved(JSON.stringify([{ ...article, published_at }]))).toEqual([]);
    }
  });

  it("drops entries a row cannot render", () => {
    const { source_name: _, ...withoutSource } = article;
    expect(parseSaved(JSON.stringify([withoutSource, { ...article, id: "1" }, null, 3]))).toEqual(
      [],
    );
  });

  it("returns an empty list for missing or broken storage", () => {
    expect(parseSaved(null)).toEqual([]);
    expect(parseSaved("{not json")).toEqual([]);
    expect(parseSaved('{"id":1}')).toEqual([]);
  });
});
