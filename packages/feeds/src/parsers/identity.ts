import type { RawItem, NormalizedArticle } from "../types";

function decodeEntities(text: string): string {
  return text
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll(/&apos;|&#39;/gu, "'")
    .replaceAll("&nbsp;", " ")
    .replaceAll(/&#(\d+);/gu, (_, code) => String.fromCodePoint(Number(code)))
    .replaceAll(/&#x([0-9a-f]+);/giu, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
}

function stripHtml(html: string): string {
  return decodeEntities(html)
    .replaceAll(/<[^>]+>/gu, "")
    .replaceAll(/\s+/gu, " ")
    .trim();
}

function truncate(text: string, max = 300): string {
  return text.length <= max ? text : text.slice(0, max).trimEnd() + "…";
}

export function identityParser(item: RawItem): NormalizedArticle {
  const raw = item.description ?? item.summary ?? item.content ?? "";
  const description = truncate(stripHtml(raw));

  const guid = item.guid ?? item.id ?? item.link ?? "";
  const published = Date.parse(item.pubDate ?? item.published ?? item.updated ?? "");

  return {
    guid,
    title: stripHtml(item.title ?? "").trim(),
    link: item.link ?? "",
    description: description || null,
    author: item.author ?? item["dc:creator"] ?? null,
    image: null,
    published_at: Number.isNaN(published) ? null : Math.floor(published / 1000),
  };
}
