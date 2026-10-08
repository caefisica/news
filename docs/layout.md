# Repository layout

The repository is a Bun workspace (`workspaces` in
[`package.json`](../package.json)) with one shared package and two workers.

```text
app/                    Nuxt 4 interface
server/api/             API routes
server/db/              migrations and D1 database data
packages/feeds/         shared ingest logic (@news-reader/feeds)
workers/coordinator/    cron that queues the sources that are due
workers/consumer/       queue that fetches and stores each source
scripts/                migration and ingest from the terminal
test/                   Vitest tests
docs/                   this documentation
.github/                workflows, issue template and CONTRIBUTING
```

## `app/`

| Folder         | Contents                                                                                |
| -------------- | --------------------------------------------------------------------------------------- |
| `pages/`       | The routes `/` (articles), `/guardados`, `/sources` and `/about`.                       |
| `components/`  | Interface components, such as the sidebar, the article list and detail, and the search. |
| `composables/` | View filters, sources, saved articles and a media-query helper.                         |
| `utils/`       | Dates, source colors and the guard that keeps shortcuts out of typing.                  |
| `layouts/`     | The layout with the sidebar.                                                            |
| `types/`       | The `Article` and `Source` types of the interface.                                      |
| `assets/css/`  | Global styles and design tokens.                                                        |

[Web app](app.md) describes how these pieces behave.

## `packages/feeds/src/`

| Path          | Responsibility                                                              |
| ------------- | --------------------------------------------------------------------------- |
| `process.ts`  | `processSource` and `listEnabledSources`: they store articles and failures. |
| `fetchers.ts` | Picks how to download, by `kind`.                                           |
| `fetch.ts`    | Downloads and reads RSS and Atom feeds.                                     |
| `instagram/`  | Downloads the posts of an account.                                          |
| `parsers/`    | One parser per kind of source, and their registry.                          |
| `schedule.ts` | `dueSources` and the cadence by `kind`.                                     |
| `errors.ts`   | `SourceError`, a failure with a reason for the reader.                      |
| `types.ts`    | `Source`, `RawItem` and `NormalizedArticle`.                                |
| `index.ts`    | The package's public exports.                                               |

The package also exposes `@news-reader/feeds/schedule` as a standalone import.
The app uses it so the `/sources` page can show the cadence.
[Architecture](architecture.md) explains how the other pieces fit together.

## Configuration

Each worker has its own `cloudflare.config.ts`: the root one for `news`, and one
in [`workers/coordinator`](../workers/coordinator) and
[`workers/consumer`](../workers/consumer). The coordinator configures the cron.
The consumer configures the queue settings. These files configure the project:

| File                                              | Purpose                                               |
| ------------------------------------------------- | ----------------------------------------------------- |
| [`cloudflare.config.ts`](../cloudflare.config.ts) | The `news` worker: bindings `ASSETS` and `DB`.        |
| [`wrangler.config.ts`](../wrangler.config.ts)     | How to build Nuxt for `cf-wrangler dev`.              |
| [`nuxt.config.ts`](../nuxt.config.ts)             | Modules, the `cloudflare_module` preset and metadata. |
| [`oxlint.config.ts`](../oxlint.config.ts)         | Lint rules.                                           |
| [`oxfmt.config.ts`](../oxfmt.config.ts)           | Code and Markdown formatting.                         |
| [`vitest.config.ts`](../vitest.config.ts)         | Which files are tests.                                |
| [`mise.toml`](../mise.toml)                       | The Bun version.                                      |
| [`tsconfig.json`](../tsconfig.json)               | Extends the config that Nuxt generates.               |
