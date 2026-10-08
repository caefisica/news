# Adding a source

A new source is one row in a new migration. You do not need to touch code when
the parser already exists. Before you start, read the
[migration rules](database.md#migrations).

## 1. Pick the kind and the parser

| Source                    | `kind`      | `parser`               |
| ------------------------- | ----------- | ---------------------- |
| Standard RSS or Atom feed | `feed`      | `identity` (or `NULL`) |
| Blogger blog              | `feed`      | `blogspot`             |
| `gob.pe` RSS search       | `feed`      | `gobpe`                |
| Public Instagram account  | `instagram` | `instagram`            |

[Sources](sources.md#parsers) describes each parser. If the feed needs another
one, write it in [`packages/feeds/src/parsers/`](../packages/feeds/src/parsers)
and register it in [`parsers/index.ts`](../packages/feeds/src/parsers/index.ts).

## 2. Write the migration

Create the next numbered file in
[`server/db/migrations`](../server/db/migrations), for example
`0009_add_<topic>_sources.sql`.

A feed:

```sql
INSERT OR IGNORE INTO sources (name, url, parser, category, language) VALUES
  ('Name', 'https://example.org/feed.xml', 'identity', 'ciencia', 'en');
```

An Instagram account, with the profile URL:

```sql
INSERT OR IGNORE INTO sources (name, url, kind, parser, category, language) VALUES
  ('@account', 'https://www.instagram.com/account/', 'instagram', 'instagram', 'institucional', 'es');
```

[Database](database.md#sources) describes the columns. For an Instagram source,
`name` is `@account`.

## 3. Update the tests

The tests apply every migration on SQLite and compare the resulting sources. Add
the new source to these lists:

- `leaves the expected set of sources` in
  [`test/migrations.test.ts`](../test/migrations.test.ts).
- `the seeded accounts` in
  [`test/instagram.test.ts`](../test/instagram.test.ts), if the source is an
  Instagram account.

## 4. Try it locally

```sh
bun run db:migrate:local
bun run ingest
bun run test
```

`ingest` prints one line per source,
`[name] inserted N, ignored M already stored, skipped K without guid, title or link`.
When a source fails, `ingest` prints `fetch failed` instead and stores the
reason in `sources.last_error`. You can see it on `/sources` when you open
`bun run dev`. See [failures](sources.md#failures).

When the change merges into `master`, [deployment](deployment.md) applies the
migration to the remote database.

## Disable or remove a source

Use a new migration to disable or remove a source. Update the test lists from
step 3 if the source is in them.

```sql
UPDATE sources SET enabled = 0 WHERE url = 'https://example.org/feed.xml';
```

A disabled source is no longer checked, and the API hides it and its articles.
`DELETE FROM sources WHERE url = ...` also deletes the source's articles, which
cascade with it.
