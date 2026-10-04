# RSS para físicxs

A news reader for physics students and researchers in Peru.

[![deploy](https://github.com/caefisica/news/actions/workflows/deploy.yml/badge.svg)](https://github.com/caefisica/news/actions/workflows/deploy.yml)

RSS para físicxs collects scholarships, calls for applications, events and
science news in one place. It reads RSS and Atom feeds from universities,
journals, blogs and public portals. It also reads the Instagram accounts of
institutions that publish only there. It stores each article in a database and
shows it on a simple website with category and source filters, search and saved
articles. The site is in Spanish.

The whole project runs on Cloudflare: a Nuxt 4 app, two ingest workers, and a D1
database.

## Quick start

You need [Bun](https://bun.sh) 1.4.2 and Node 24 or later.

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

- RSS and Atom feeds and public Instagram accounts as sources. Each source has a
  category and a language.
- Four parsers: standard feeds, Blogger, `gob.pe` and Instagram.
- A `/sources` page that shows the last successful check of each source, and the
  reason when a check fails.
- Articles saved in the browser, and keyboard shortcuts.
- A read-only API with two routes: `/api/articles` and `/api/sources`.

## Non-goals

- No accounts and no user data. Saved articles live in the browser's
  `localStorage`.
- No copy of the full article. The app stores the title, summary, author, image
  and link. The reader opens the original.
- No Instagram login. Every request is anonymous.

## Documentation

The full manual is in [docs](docs/readme.md):

- [Architecture](docs/architecture.md): how an article reaches the database.
- [Sources](docs/sources.md): source kinds, parsers and polling cadence.
- [Adding a source](docs/adding-a-source.md): the migration and the tests.
- [Database](docs/database.md): the tables and the migration rules.
- [API](docs/api.md): the `/api/articles` and `/api/sources` routes.
- [Local development](docs/local-development.md): commands and tests.
- [Deployment](docs/deployment.md): the workflow and its secrets.
- [Repository layout](docs/layout.md): what each folder holds.

To contribute, read [CONTRIBUTING](.github/CONTRIBUTING.md). To suggest a
source, open an
[issue](https://github.com/caefisica/news/issues/new?template=suggest-source.md).

## License

Apache 2.0. See [LICENSE](LICENSE).
