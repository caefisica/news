import type { Parser, RawItem, NormalizedArticle } from "../types";
import { blogspotParser } from "./blogspot";
import { gobpeParser } from "./gobpe";
import { identityParser } from "./identity";
import { instagramParser } from "./instagram";

export type { RawItem, NormalizedArticle };

const registry: Record<string, Parser> = {
  identity: identityParser,
  blogspot: blogspotParser,
  gobpe: gobpeParser,
  instagram: instagramParser,
};

export function parseItem(item: RawItem, parserKey: string | null): NormalizedArticle {
  const parser = (parserKey ? registry[parserKey] : undefined) ?? identityParser;
  return parser(item);
}
