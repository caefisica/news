# Documentation

1. [Architecture](architecture.md): the cron, the queue, the consumer and D1,
   and how an article reaches the database.
2. [Sources](sources.md): the kind of each source, the parsers, the polling
   cadence and how failures show up.
3. [Adding a source](adding-a-source.md): the migration row that registers a
   source and the tests to update.
4. [Database](database.md): the `sources` and `articles` tables and the
   migration rules.
5. [API](api.md): the `/api/articles` and `/api/sources` routes.
6. [Local development](local-development.md): requirements, commands and tests.
7. [Deployment](deployment.md): the GitHub Actions workflow and its secrets.
8. [Repository layout](layout.md): what each folder holds.

To contribute, read [CONTRIBUTING](../.github/CONTRIBUTING.md).
