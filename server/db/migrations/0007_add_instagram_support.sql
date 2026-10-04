-- How a source is fetched: 'feed' reads RSS or Atom, 'instagram' reads an account's posts.
ALTER TABLE sources ADD COLUMN kind TEXT NOT NULL DEFAULT 'feed';

-- Cover image of an article, as a URL.
ALTER TABLE articles ADD COLUMN image TEXT;
