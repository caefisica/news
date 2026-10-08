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

Run these scripts from [`package.json`](../package.json) before you open a pull
request:

```sh
bun run typecheck
bun run lint
bun run test
bun run format
```

If you change the database, read the
[migrations](../docs/database.md#migrations) section first.
