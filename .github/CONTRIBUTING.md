# Contributing

- To suggest a source, use the
  [issue template](https://github.com/caefisica/news/issues/new?template=suggest-source.md).
  To add it yourself, follow [adding a source](../docs/adding-a-source.md).
- To understand the code, start with the [architecture](../docs/architecture.md)
  and the [repository layout](../docs/layout.md).

## Set up

[Local development](../docs/local-development.md) has the requirements and the
first start.

## Checks

These checks are defined as scripts in [`package.json`](../package.json):

```sh
bun run typecheck
bun run lint
bun run test
bun run format
```

The [deployment](../docs/deployment.md) workflow runs `typecheck` and `lint` on
every push to `master`. It does not run the tests or the formatter.

If you change the database, read the
[migrations](../docs/database.md#migrations) section first.
