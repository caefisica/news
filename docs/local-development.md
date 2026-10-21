# Local development

## Requirements

- [mise](https://mise.jdx.dev). `mise install` downloads the Bun and Node
  versions pinned in [`mise.toml`](../mise.toml). The commands below are the
  scripts of [`package.json`](../package.json). The tests use `node:sqlite`, so
  Node 24 or later (`engines`).

You do not need a Cloudflare account to work locally.

## First start

Run the commands of the readme's [quick start](../readme.md#quick-start).
`db:migrate:local` creates the local database and its sources. `ingest`
downloads the articles of every source. `dev` builds the app and serves it at
<http://localhost:8787>.

`bun run dev` runs `cf-wrangler dev`. It builds Nuxt with `nuxt build` and
serves the result with local bindings. It rebuilds when something changes in
`app`, `server` or `packages/feeds/src`
([`wrangler.config.ts`](../wrangler.config.ts)).

The local database lives in `.wrangler/state`, which Git ignores.
`db:migrate:local`, `ingest` and `dev` share it. To start over, delete that
folder and migrate again.

`bun run ingest` ([`scripts/ingest.ts`](../scripts/ingest.ts)) processes the
enabled sources directly, with no queue and no cron. It ignores the
[polling cadence](sources.md#polling-cadence) and checks every source on each
run. It prints one line per source.

## Commands

| Command                         | What it does                                                                                                                       |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `bun install --frozen-lockfile` | Installs the dependencies from `bun.lock` without resolving.                                                                       |
| `bun run dev`                   | Builds and serves the app locally.                                                                                                 |
| `bun run build`                 | Builds Nuxt and prepares the worker for deployment.                                                                                |
| `bun run types`                 | Generates the runtime and binding types in `.cloudflare/types` for the app and workers, and the Nuxt types.                        |
| `bun run typecheck`             | Regenerates the types and checks the app, `packages/feeds`, the workers, `test` and `scripts`.                                     |
| `bun run test`                  | Regenerates the types and runs the tests with Vitest.                                                                              |
| `bun run lint`                  | Regenerates the types, then checks code with type-aware oxlint (warnings fail) and formatting with oxfmt. Changes no tracked file. |
| `bun run fix`                   | Regenerates the types, applies oxlint's safe fixes and formats code, Markdown, JSON and YAML with oxfmt.                           |
| `bun run check`                 | Runs `lint`, `typecheck`, `test` and `build`. CI runs it.                                                                          |
| `bun run ingest`                | Ingests every source into the local database.                                                                                      |
| `bun run db:migrate:local`      | Applies the pending migrations to the local database.                                                                              |
| `bun run db:migrate`            | Applies the pending migrations to the remote database.                                                                             |
| `bun run deploy:news`           | Builds and deploys the `news` worker.                                                                                              |
| `bun run deploy:coordinator`    | Deploys the coordinator worker.                                                                                                    |
| `bun run deploy:consumer`       | Deploys the consumer worker.                                                                                                       |

`db:migrate` and the `deploy` scripts need Cloudflare credentials. In the normal
flow, [deployment](deployment.md) runs them, not a person.

## Tooling

The project uses Cloudflare's [`cf`](https://developers.cloudflare.com/cf/) CLI.
The types in `.cloudflare/types` and the files in `.nuxt` are in `.gitignore`.
`bun run lint`, `typecheck` and `test` regenerate them before they run, and
`bun run check` leaves every tracked file unchanged.

## Tests

The tests are in [`test/`](../test) and use Vitest. They run with no network and
no Cloudflare:

- They apply the real migrations on in-memory SQLite and use a minimal stand-in
  for D1 ([`test/db.ts`](../test/db.ts)).
- Feeds and Instagram accounts answer from a local HTTP server. The Instagram
  responses are in [`test/fixtures/instagram`](../test/fixtures/instagram).
