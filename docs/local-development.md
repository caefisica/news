# Local development

## Requirements

- [Bun](https://bun.sh), the version in [`mise.toml`](../mise.toml). With
  [mise](https://mise.jdx.dev) installed, `mise install` downloads it.
- Node 24 or later (`engines` in [`package.json`](../package.json)). The tests
  use `node:sqlite`.

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

| Command                    | What it does                                                                |
| -------------------------- | --------------------------------------------------------------------------- |
| `bun run dev`              | Builds and serves the app locally.                                          |
| `bun run build`            | Builds Nuxt and prepares the worker for deployment.                         |
| `bun run types`            | Generates the runtime and binding types in `.cloudflare/types`.             |
| `bun run typecheck`        | Regenerates the types and checks the app, `packages/feeds` and the workers. |
| `bun run test`             | Runs the tests with Vitest.                                                 |
| `bun run lint`             | Lints the code with oxlint.                                                 |
| `bun run lint:fix`         | Applies oxlint's automatic fixes.                                           |
| `bun run format`           | Formats the code and the Markdown with oxfmt.                               |
| `bun run format:check`     | Fails when a file needs formatting. Writes nothing.                         |
| `bun run ingest`           | Ingests every source into the local database.                               |
| `bun run db:migrate:local` | Applies the pending migrations to the local database.                       |
| `bun run db:migrate`       | Applies the pending migrations to the remote database.                      |
| `bun run deploy`           | Deploys the worker of the current folder. At the root, it builds first.     |

`db:migrate` and `deploy` need Cloudflare credentials. In the normal flow,
[deployment](deployment.md) runs them, not a person.

## Tooling

The project uses Cloudflare's [`cf`](https://developers.cloudflare.com/cf/) CLI.
The types in `.cloudflare/types` are in `.gitignore`. `bun run typecheck`
regenerates them before it checks.

## Tests

The tests are in [`test/`](../test) and use Vitest. They run with no network and
no Cloudflare:

- They apply the real migrations on in-memory SQLite and use a minimal stand-in
  for D1 ([`test/db.ts`](../test/db.ts)).
- Feeds and Instagram accounts answer from a local HTTP server. The Instagram
  responses are in [`test/fixtures/instagram`](../test/fixtures/instagram).
