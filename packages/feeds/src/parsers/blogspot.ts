import type { RawItem, NormalizedArticle } from "../types";
import { identityParser } from "./identity";

export function blogspotParser(item: RawItem): NormalizedArticle {
  const base = identityParser(item);

  const cleaned =
    base.description
      ?.replace(/Posted by .+?at \d{1,2}:\d{2} [AP]M\.?/iu, "")
      ?.replace(/No comments?:/iu, "")
      ?.trim() ?? null;

  return { ...base, description: cleaned || base.description };
}
