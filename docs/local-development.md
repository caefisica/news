# Local development

## Requirements

- [mise](https://mise.jdx.dev). `mise install` downloads the Bun and Node
  versions pinned in [`mise.toml`](../mise.toml), which also defines every task
  below. The tests use `node:sqlite`, so Node 24 or later (`engines` in
  [`package.json`](../package.json)).

You do not need a Cloudflare account to work locally.

## First start

Run the commands of the readme's [quick start](../readme.md#quick-start).
`db:migrate:local` creates the local database and its sources. `ingest`
downloads the articles of every source. `dev` builds the app and serves it at
<http://localhost:8787>.

`mise run dev` runs `cf-wrangler dev`. It builds Nuxt with `nuxt build` and
serves the result with local bindings. It rebuilds when something changes in
`app`, `server` or `packages/feeds/src`
([`wrangler.config.ts`](../wrangler.config.ts)).

The local database lives in `.wrangler/state`, which Git ignores.
`db:migrate:local`, `ingest` and `dev` share it. To start over, delete that
folder and migrate again.

`mise run ingest` ([`scripts/ingest.ts`](../scripts/ingest.ts)) processes the
enabled sources directly, with no queue and no cron. It ignores the
[polling cadence](sources.md#polling-cadence) and checks every source on each
run. It prints one line per source.

## Commands

| Command                       | What it does                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| `mise run install`            | Installs the dependencies from `bun.lock` without resolving.                                           |
| `mise run dev`                | Builds and serves the app locally.                                                                     |
| `mise run build`              | Builds Nuxt and prepares the worker for deployment.                                                    |
| `mise run types`              | Generates the runtime and binding types in `.cloudflare/types`, for the app and workers.               |
| `mise run typecheck`          | Regenerates the types and checks the app, `packages/feeds`, the workers, `test` and `scripts`.         |
| `mise run test`               | Runs the tests with Vitest.                                                                            |
| `mise run lint`               | Checks code with type-aware oxlint (warnings fail) and formatting with oxfmt. Changes no tracked file. |
| `mise run fix`                | Applies oxlint's safe fixes and formats code, Markdown, JSON and YAML with oxfmt.                      |
| `mise run check`              | Runs `lint`, `typecheck`, `test` and `build`. CI runs it.                                              |
| `mise run ingest`             | Ingests every source into the local database.                                                          |
| `mise run db:migrate:local`   | Applies the pending migrations to the local database.                                                  |
| `mise run db:migrate`         | Applies the pending migrations to the remote database.                                                 |
| `mise run deploy:news`        | Builds and deploys the `news` worker.                                                                  |
| `mise run deploy:coordinator` | Deploys the coordinator worker.                                                                        |
| `mise run deploy:consumer`    | Deploys the consumer worker.                                                                           |

`db:migrate` and the `deploy` tasks need Cloudflare credentials. In the normal
flow, [deployment](deployment.md) runs them, not a person.

## Tooling

The project uses Cloudflare's [`cf`](https://developers.cloudflare.com/cf/) CLI.
The types in `.cloudflare/types` and the files in `.nuxt` are in `.gitignore`.
`mise run lint`, `typecheck` and `test` regenerate them before they run, and
`mise run check` leaves every tracked file unchanged.

## Tests

The tests are in [`test/`](../test) and use Vitest. They run with no network and
no Cloudflare:

- They apply the real migrations on in-memory SQLite and use a minimal stand-in
  for D1 ([`test/db.ts`](../test/db.ts)).
- Feeds and Instagram accounts answer from a local HTTP server. The Instagram
  responses are in [`test/fixtures/instagram`](../test/fixtures/instagram).
