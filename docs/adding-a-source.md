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

`kind` is `feed` when you omit it. A null or unknown `parser` uses `identity`.
[Sources](sources.md#parsers) describes each one.

If the feed needs another parser, write one in
[`packages/feeds/src/parsers/`](../packages/feeds/src/parsers) and register it
in [`parsers/index.ts`](../packages/feeds/src/parsers/index.ts).

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

| Column     | What to put                                                                                                                 |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| `name`     | The name the reader sees. For Instagram, `@account`.                                                                        |
| `url`      | The feed or profile URL. It is unique. `INSERT OR IGNORE` skips it if it already exists.                                    |
| `category` | `becas`, `institucional`, `divulgacion` or `ciencia`. Any other value shows as is, and the sidebar offers no filter for it. |
| `language` | ISO 639-1 code of the source's language. It is `es` when you omit it.                                                       |

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

`ingest` prints one `upserted` line per source with the number of stored
articles. When a source fails, it prints `fetch failed` instead and stores the
reason in `sources.last_error`. You can see it on `/sources` when you open
`bun run dev`. See [failures](sources.md#failures).

When the change merges into `master`, [deployment](deployment.md) applies the
migration to the remote database.
