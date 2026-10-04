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
  // Optional because saved articles in localStorage predate these columns.
  language?: string;
  image?: string | null;
}

export interface Source {
  id: number;
  name: string;
  category: string | null;
  language: string;
  last_fetched_at: number | null;
  last_error: string | null;
  article_count: number;
}
