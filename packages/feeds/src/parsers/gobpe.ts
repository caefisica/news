import type { RawItem, NormalizedArticle } from "../types";
import { identityParser } from "./identity";

export function gobpeParser(item: RawItem): NormalizedArticle {
  const base = identityParser(item);

  // Collection pages lack <pubDate>, so processSource skips their empty guid.
  if (!item.pubDate) {
    return { ...base, guid: "" };
  }

  // The feed's <link> points to the collection page, so use a URL-valued guid.
  const directLink =
    typeof item.guid === "string" && item.guid.startsWith("http") ? item.guid : base.link;

  return { ...base, link: directLink };
}
