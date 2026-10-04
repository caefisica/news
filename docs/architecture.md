# Architecture

The project has three Cloudflare Workers and one D1 database. Two workers ingest
articles. The third is the web app, which only reads.

```mermaid
flowchart LR
    A[cron<br/>every 15 min]
    B[coordinator]
    Q[queue<br/>feed-ingestion]
    C[consumer]
    D[(D1)]
    W[news<br/>Nuxt]

    A --> B
    B -->|due sources,<br/>in groups of 40| Q
    Q --> C
    C -->|fetch, parse, insert| D
    D --> W
```

| Worker                    | Folder                                          | What it does                                          |
| ------------------------- | ----------------------------------------------- | ----------------------------------------------------- |
| `news-reader-coordinator` | [`workers/coordinator`](../workers/coordinator) | Picks the sources that are due and queues them.       |
| `news-reader-consumer`    | [`workers/consumer`](../workers/consumer)       | Fetches, parses and stores each source.               |
| `news`                    | root                                            | Serves the interface and the read-only [API](api.md). |

## The ingest flow

1. **Cron.**
   [`workers/coordinator/cloudflare.config.ts`](../workers/coordinator/cloudflare.config.ts)
   schedules the coordinator with `*/15 * * * *`.
2. **Coordinator.**
   [`workers/coordinator/src/index.ts`](../workers/coordinator/src/index.ts)
   reads the sources with `enabled = 1` and keeps those that
   [`dueSources`](../packages/feeds/src/schedule.ts) marks as due for that run
   (see [polling cadence](sources.md#polling-cadence)). It splits them into
   groups of 40 and sends each group to the `feed-ingestion` queue as one
   `{ sources }` message. When no source is due, it sends nothing.
3. **Consumer.**
   [`workers/consumer/src/index.ts`](../workers/consumer/src/index.ts) receives
   one message per invocation (`maxBatchSize: 1`). It processes the message's
   sources in parallel with `Promise.allSettled` and acknowledges the message
   (`ack`) after every source finishes.
4. **Source.** [`processSource`](../packages/feeds/src/process.ts) does the work
   for one source:

   ```text
   fetchItems ⇢ parseItem ⇢ INSERT OR IGNORE ⇢ UPDATE sources
   ```

   - `fetchItems` downloads by the source's `kind`: an XML feed or an Instagram
     account.
   - `parseItem` turns each item into a normalized article, using the parser
     named in the `parser` column.
   - `INSERT OR IGNORE` stores the articles that have a `guid`, a `title` and a
     `link`. The unique key `(source_id, guid)` prevents duplicates, so a stored
     article is never updated.
   - When everything works, `last_fetched_at` takes the current time and
     `last_error` becomes `NULL`.
   - When the download fails, `last_error` holds the reason. The articles and
     `last_fetched_at` stay as they were.

The consumer catches the error of each source, so a failure does not retry the
message. The queue's retries (`maxRetries: 3`) apply only if the handler itself
throws.

## Where each piece lives

The ingest logic is in the package [`packages/feeds`](../packages/feeds)
(`@news-reader/feeds`). The two workers only orchestrate it. The script
[`scripts/ingest.ts`](../scripts/ingest.ts) uses the same package to ingest
locally, without a queue.

The web app is in [`app/`](../app) and [`server/`](../server). Nuxt builds with
the `cloudflare_module` preset. The routes in [`server/api`](../server/api) read
the `DB` binding.

The three workers share one D1 database. Its name and id are in
[`server/db/database.json`](../server/db/database.json), and each
`cloudflare.config.ts` reads them from there.
