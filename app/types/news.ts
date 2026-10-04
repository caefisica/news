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
}

export interface Source {
  id: number;
  name: string;
  category: string | null;
  last_fetched_at: number | null;
  article_count: number;
}
