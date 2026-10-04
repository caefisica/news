import { SourceError } from "./errors";
import { fetchItems } from "./fetchers";
import { parseItem } from "./parsers/index";
import type { Source } from "./types";

export async function listEnabledSources(db: D1Database): Promise<Source[]> {
  const { results } = await db
    .prepare("SELECT id, name, url, kind, parser, category FROM sources WHERE enabled = 1")
    .all<Source>();
  return results;
}

// A failed fetch records why and leaves `last_fetched_at` and the stored
// articles as they were, so the sources page shows the last success.
async function recordFailure(source: Source, db: D1Database, err: unknown): Promise<void> {
  const reason =
    err instanceof SourceError
      ? err.message
      : "No se pudo revisar la fuente por un error inesperado.";
  await db.prepare("UPDATE sources SET last_error = ? WHERE id = ?").bind(reason, source.id).run();
  console.error(
    `[${source.name}] fetch failed: ${err instanceof Error ? err.message : String(err)}`,
  );
}

export async function processSource(source: Source, db: D1Database): Promise<void> {
  let items;
  try {
    items = await fetchItems(source);
  } catch (err) {
    await recordFailure(source, db, err);
    return;
  }

  const normalized = items.map((item) => parseItem(item, source.parser));

  const stmt = db.prepare(
    `INSERT OR IGNORE INTO articles (source_id, guid, title, link, description, author, image, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const inserts = normalized
    .filter((a) => a.guid && a.title && a.link)
    .map((a) =>
      stmt.bind(
        source.id,
        a.guid,
        a.title,
        a.link,
        a.description,
        a.author,
        a.image,
        a.published_at,
      ),
    );

  if (inserts.length > 0) {
    await db.batch(inserts);
  }

  await db
    .prepare("UPDATE sources SET last_fetched_at = unixepoch(), last_error = NULL WHERE id = ?")
    .bind(source.id)
    .run();

  console.log(`[${source.name}] upserted ${inserts.length}/${normalized.length} articles`);
}
