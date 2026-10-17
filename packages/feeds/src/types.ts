export type SourceKind = "feed" | "instagram";

export interface Source {
  id: number;
  name: string;
  url: string;
  kind: SourceKind;
  parser: string | null;
  category: string | null;
}

export interface RawItem {
  title?: string;
  link?: string;
  guid?: string;
  pubDate?: string;
  published?: string;
  updated?: string;
  author?: string;
  description?: string;
  content?: string;
  image?: string;
}

export interface NormalizedArticle {
  guid: string;
  title: string;
  link: string;
  description: string | null;
  author: string | null;
  image: string | null;
  published_at: number | null;
}

export type Parser = (item: RawItem) => NormalizedArticle;
