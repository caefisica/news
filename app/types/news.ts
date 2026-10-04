export interface Article {
  id: number;
  title: string;
  link: string;
  description: string | null;
  author: string | null;
  published_at: number | null;
  source_id: number;
  source_name: string;
  category: string | null;
  // Optional because saved articles in localStorage predate the column.
  language?: string;
}

export interface Source {
  id: number;
  name: string;
  category: string | null;
  language: string;
  last_fetched_at: number | null;
  article_count: number;
}
