import { decodeNumericReference } from "../entities";
import type { RawItem, NormalizedArticle } from "../types";

function decodeEntities(text: string): string {
  return text
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&nbsp;", " ")
    .replaceAll(/&#(?:\d+|x[0-9a-f]+);/giu, decodeNumericReference)
    .replaceAll("&amp;", "&");
}

function isTagStart(character: string | undefined): boolean {
  if (character === "/" || character === "!" || character === "?") {
    return true;
  }

  const code = character?.codePointAt(0) ?? 0;
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

function stripHtml(html: string): string {
  const text: string[] = [];

  for (let index = 0; index < html.length; index += 1) {
    if (html[index] === "<" && isTagStart(html[index + 1])) {
      const end = html.indexOf(">", index + 2);
      if (end !== -1) {
        index = end;
        continue;
      }
    }

    text.push(html[index]);
  }

  return text.join("").replaceAll(/\s+/gu, " ").trim();
}

function cleanText(text: string): string {
  return decodeEntities(stripHtml(text));
}

function truncate(text: string, max = 300): string {
  return text.length <= max ? text : text.slice(0, max).trimEnd() + "…";
}

export function identityParser(item: RawItem): NormalizedArticle {
  const raw = item.description ?? item.content ?? "";
  const description = truncate(cleanText(raw));

  const guid = item.guid ?? item.link ?? "";
  const published = Date.parse(item.pubDate ?? item.published ?? item.updated ?? "");

  return {
    guid,
    title: cleanText(item.title ?? "").trim(),
    link: item.link ?? "",
    description: description || null,
    author: item.author ?? null,
    image: null,
    published_at: Number.isNaN(published) ? null : Math.floor(published / 1000),
  };
}
