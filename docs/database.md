# Database

The project uses one Cloudflare D1 database. Its name and id are in
[`server/db/database.json`](../server/db/database.json). The three
`cloudflare.config.ts` files, [`scripts/migrate.ts`](../scripts/migrate.ts) and
[`scripts/ingest.ts`](../scripts/ingest.ts) read them from there.

## Tables

### `sources`

| Column            | Type                  | Meaning                                                   |
| ----------------- | --------------------- | --------------------------------------------------------- |
| `id`              | `INTEGER` (key)       | Identifier.                                               |
| `name`            | `TEXT`                | The name the reader sees.                                 |
| `url`             | `TEXT`, unique        | The feed URL or the Instagram profile URL.                |
| `enabled`         | `INTEGER`, 1          | With `0`, the source is not checked and not in the API.   |
| `kind`            | `TEXT`, `'feed'`      | How the items are fetched: `feed` or `instagram`.         |
| `parser`          | `TEXT`, may be `NULL` | How each item is read. See [parsers](sources.md#parsers). |
| `category`        | `TEXT`, may be `NULL` | `becas`, `institucional`, `divulgacion` or `ciencia`.     |
| `language`        | `TEXT`, `'es'`        | ISO 639-1 code of the source's language.                  |
| `last_fetched_at` | `INTEGER`             | Last successful check, in Unix seconds.                   |
| `last_error`      | `TEXT`                | Reason for the last failed check. `NULL` when it worked.  |
| `created_at`      | `INTEGER`             | Creation time, in Unix seconds.                           |

Any other `category` shows as is in the interface, and the sidebar has no filter
for it. `INSERT` leaves `kind` as `feed` and `language` as `es` when you omit
them.

### `articles`

| Column         | Type            | Meaning                                           |
| -------------- | --------------- | ------------------------------------------------- |
| `id`           | `INTEGER` (key) | Identifier.                                       |
| `source_id`    | `INTEGER`       | The article's source. Deleted in cascade with it. |
| `guid`         | `TEXT`          | The article's identifier in its source.           |
| `title`        | `TEXT`          | Title.                                            |
| `link`         | `TEXT`          | Link to the original.                             |
| `description`  | `TEXT`          | Summary.                                          |
| `author`       | `TEXT`          | Author.                                           |
| `image`        | `TEXT`          | URL of the cover image.                           |
| `published_at` | `INTEGER`       | Publication time, in Unix seconds.                |
| `fetched_at`   | `INTEGER`       | Time it was stored, in Unix seconds.              |

The pair `(source_id, guid)` is unique. The indexes are `idx_articles_published`
and `idx_articles_source`.

## Migrations

Migrations are numbered SQL files in
[`server/db/migrations`](../server/db/migrations). They define the schema and
also the sources.

- Existing files are numbered in sequence and named in English for what they
  change, such as `0008_add_instagram_sources.sql`.
- An applied migration does not run again. Editing it never reaches a database
  that already applied it, so a change goes in a new migration.
- [Deployment](deployment.md) applies the pending migrations before it deploys
  the workers. While the deploy runs, the old code runs on the new schema, so a
  migration must leave the old code working.
- The migrations that add sources use `INSERT OR IGNORE`. The URL is unique, so
  the insert is skipped when the source already exists.
- The tests apply every file, in order, on SQLite, so the SQL must be valid
  SQLite. See [tests](local-development.md#tests).
- The linter ignores this folder (`migrations/**` in
  [`oxlint.config.ts`](../oxlint.config.ts)).

To apply them:

```sh
bun run db:migrate:local
bun run db:migrate
```

The first command applies them to the local database in `.wrangler/state`. The
second applies them to the remote database and needs the credentials in
[deployment](deployment.md#secrets). Both go through
[`scripts/migrate.ts`](../scripts/migrate.ts), which runs
`cf d1 migrations apply` with the id from `database.json`. It passes extra
arguments through to `cf`. A second `db:migrate:local` applies nothing.

To add a source with a migration, go to [adding a source](adding-a-source.md).
