export default defineEventHandler(async (event) => {
  const { DB } = event.context.cloudflare.env as { DB: D1Database };

  const { results } = await DB.prepare(`
      SELECT
        id, name, category, language,
        last_fetched_at,
        (SELECT COUNT(*) FROM articles WHERE source_id = sources.id) AS article_count
      FROM sources
      WHERE enabled = 1
      ORDER BY name ASC
    `).all();

  return { sources: results };
});
