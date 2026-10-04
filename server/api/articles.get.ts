export default defineEventHandler(async (event) => {
  const { DB } = event.context.cloudflare.env as { DB: D1Database };

  const query = getQuery(event);
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  const sourceIds = query.source_id
    ? String(query.source_id).split(",").map(Number).filter(Boolean)
    : null;

  const search = query.q ? String(query.q).trim() : null;

  let sql = `
    SELECT
      a.id, a.title, a.link, a.description, a.author, a.image, a.published_at,
      s.id AS source_id, s.name AS source_name, s.category, s.language
    FROM articles a
    JOIN sources s ON a.source_id = s.id
    WHERE s.enabled = 1
  `;
  const bindings: (string | number)[] = [];

  if (sourceIds && sourceIds.length > 0) {
    sql += ` AND a.source_id IN (${sourceIds.map(() => "?").join(",")})`;
    bindings.push(...sourceIds);
  }

  if (search) {
    sql += ` AND (a.title LIKE ? OR a.description LIKE ?)`;
    bindings.push(`%${search}%`, `%${search}%`);
  }

  sql += ` ORDER BY a.published_at DESC LIMIT ? OFFSET ?`;
  bindings.push(pageSize, offset);

  const { results } = await DB.prepare(sql)
    .bind(...bindings)
    .all();

  return { articles: results, page, pageSize };
});
