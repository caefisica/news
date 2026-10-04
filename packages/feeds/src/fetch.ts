import { SourceError } from "./errors";
import type { RawItem } from "./types";

// Minimal XML → object extraction without a DOM parser dependency.
// Handles both RSS 2.0 (<item>) and Atom 1.0 (<entry>) feeds.

function extractText(xml: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "iu");
  return re.exec(xml)?.[1]?.trim();
}

function extractAttr(xml: string, tag: string, attr: string): string | undefined {
  const re = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, "iu");
  return re.exec(xml)?.[1]?.trim();
}

function parseItems(xml: string): RawItem[] {
  const itemTag = xml.includes("<entry") ? "entry" : "item";
  const itemRe = new RegExp(`<${itemTag}[\\s>]([\\s\\S]*?)<\\/${itemTag}>`, "giu");
  const items: RawItem[] = [];

  let match: RegExpExecArray | null;
  while ((match = itemRe.exec(xml)) !== null) {
    const block = match[1];

    // For Atom feeds, <link href="..."/> is self-closing
    const link = extractText(block, "link") ?? extractAttr(block, "link", "href");
    const guid = extractText(block, "guid") ?? extractText(block, "id") ?? link;

    items.push({
      title: extractText(block, "title"),
      link,
      guid,
      pubDate: extractText(block, "pubDate"),
      published: extractText(block, "published"),
      updated: extractText(block, "updated"),
      author: extractText(block, "author") ?? extractText(block, "dc:creator"),
      description: extractText(block, "description") ?? extractText(block, "summary"),
      content: extractText(block, "content:encoded") ?? extractText(block, "content"),
    });
  }

  return items;
}

export async function fetchFeed(url: string): Promise<RawItem[]> {
  const res = await fetch(url, {
    headers: { "User-Agent": "caefisica-news-reader/1.0" },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new SourceError(`La fuente respondió con el código ${res.status}.`);
  }

  const xml = await res.text();

  // Reject HTML bot-check pages that return 200 instead of feed XML.
  if (!/<(?:rss|feed|rdf:RDF)[\s>]/iu.test(xml)) {
    throw new SourceError("La respuesta no es un feed RSS ni Atom.");
  }

  return parseItems(xml);
}
