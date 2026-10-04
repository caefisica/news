import type { RawItem, NormalizedArticle } from "../types";
import { identityParser } from "./identity";

// Skip gob.pe collection pages because they have no <pubDate>. An empty guid
// prevents ingestion. Use a URL-valued <guid> as the article link because the
// feed's <link> points to the collection page.
export function gobpeParser(item: RawItem): NormalizedArticle {
  const base = identityParser(item);

  if (!item.pubDate) {
    return { ...base, guid: "" };
  }

  const directLink =
    typeof item.guid === "string" && item.guid.startsWith("http") ? item.guid : base.link;

  return { ...base, link: directLink };
}
