import { fetchFeed } from "./fetch";
import { fetchInstagram } from "./instagram/fetch";
import type { RawItem, Source, SourceKind } from "./types";

const fetchers: Record<SourceKind, (url: string) => Promise<RawItem[]>> = {
  feed: fetchFeed,
  instagram: fetchInstagram,
};

// The kind of a source says how to get its items. Its parser says how to read them.
export function fetchItems(source: Source): Promise<RawItem[]> {
  return fetchers[source.kind](source.url);
}
