# RSS para Físicos

A news reader for physics students and researchers in Peru.

[![deploy](https://github.com/caefisica/news/actions/workflows/deploy.yml/badge.svg)](https://github.com/caefisica/news/actions/workflows/deploy.yml)

RSS para Físicos collects scholarships, calls for applications, events and
science news in one place. It reads RSS and Atom feeds from universities,
journals, blogs and public portals. It also reads the Instagram accounts of
institutions that publish only there. It stores each article in a database and
shows it on a website with category and source filters, search and saved
articles. The site is in Spanish.

The whole project runs on Cloudflare: a Nuxt 4 app, two ingest workers, a queue
and a D1 database.

## Quick start

You need [Bun](https://bun.sh), the version in [`mise.toml`](mise.toml), and
Node 24 or later.

```sh
git clone https://github.com/caefisica/news.git
cd news

bun install
bun run db:migrate:local
bun run ingest
bun run dev
```

The app runs at <http://localhost:8787> with every source already loaded into a
local database. See [Local development](docs/local-development.md) for details.

## Features

- RSS and Atom feeds (including Blogger and `gob.pe`) and public Instagram
  accounts as sources. Each source has an optional category and a language.
- A `/sources` page that shows the last successful check of each source, and the
  reason when a check fails.
- Keyboard shortcuts and articles saved only in the browser. Saved articles do
  not follow you to another browser or device.
- A read-only API with two routes: `/api/articles` and `/api/sources`.

## Documentation

The [manual](docs/readme.md) lists every document. To contribute, read
[CONTRIBUTING](.github/CONTRIBUTING.md). To suggest a source, open an
[issue](https://github.com/caefisica/news/issues/new?template=suggest-source.md).

## License

Apache 2.0. See [LICENSE](LICENSE).
