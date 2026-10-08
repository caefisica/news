import { SourceError } from "./errors";
import { fetchItems } from "./fetchers";
import { parseItem } from "./parsers/index";
import type { NormalizedArticle, Source } from "./types";

export async function listEnabledSources(db: D1Database): Promise<Source[]> {
  const { results } = await db
    .prepare("SELECT id, name, url, kind, parser, category FROM sources WHERE enabled = 1")
    .all<Source>();
  return results;
}

// A failed check records why and leaves `last_fetched_at` and the stored
// articles as they were, so the sources page shows the last success.
async function recordFailure(source: Source, db: D1Database, err: unknown): Promise<void> {
  console.error(
    `[${source.name}] fetch failed: ${err instanceof Error ? err.message : String(err)}`,
  );
  const reason =
    err instanceof SourceError
      ? err.message
      : "No se pudo revisar la fuente por un error inesperado.";
  await db.prepare("UPDATE sources SET last_error = ? WHERE id = ?").bind(reason, source.id).run();
}

// Return the number of rows inserted by the database.
async function store(source: Source, db: D1Database, articles: NormalizedArticle[]) {
  const stmt = db.prepare(
    `INSERT OR IGNORE INTO articles (source_id, guid, title, link, description, author, image, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const inserts = articles.map((a) =>
    stmt.bind(source.id, a.guid, a.title, a.link, a.description, a.author, a.image, a.published_at),
  );

  const results = inserts.length > 0 ? await db.batch(inserts) : [];

  await db
    .prepare("UPDATE sources SET last_fetched_at = unixepoch(), last_error = NULL WHERE id = ?")
    .bind(source.id)
    .run();

  return results.reduce((total, result) => total + result.meta.changes, 0);
}

// Fetch and parse failures resolve after recording `sources.last_error`.
// Database failures reject after recording the error so the caller can retry.
export async function processSource(source: Source, db: D1Database): Promise<void> {
  let parsed;
  try {
    parsed = (await fetchItems(source)).map((item) => parseItem(item, source.parser));
  } catch (err) {
    await recordFailure(source, db, err);
    return;
  }

  const articles = parsed.filter((a) => a.guid && a.title && a.link);

  let inserted;
  try {
    inserted = await store(source, db, articles);
  } catch (err) {
    await recordFailure(source, db, err);
    throw err;
  }

  console.log(
    `[${source.name}] inserted ${inserted}, ignored ${articles.length - inserted} already stored, ` +
      `skipped ${parsed.length - articles.length} without guid, title or link`,
  );
}
