import type { Parser, RawItem, NormalizedArticle } from "../types";
import { blogspotParser } from "./blogspot";
import { identityParser } from "./identity";
import { pronabecParser } from "./pronabec";

export type { RawItem, NormalizedArticle };

const registry: Record<string, Parser> = {
  identity: identityParser,
  blogspot: blogspotParser,
  pronabec: pronabecParser,
};

export function parseItem(item: RawItem, parserKey: string | null): NormalizedArticle {
  const parser = (parserKey ? registry[parserKey] : undefined) ?? identityParser;
  return parser(item);
}
