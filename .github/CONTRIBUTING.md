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

Run the checks before you open a pull request. They are the scripts of
[`package.json`](../package.json), and CI runs the same ones with the tools
pinned in [`mise.toml`](../mise.toml):

```sh
bun run fix
bun run check
```

If you change the database, read the
[migrations](../docs/database.md#migrations) section first.
