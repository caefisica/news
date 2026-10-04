# API

The app exposes two read-only `GET` routes. They are implemented in
[`server/api/articles.get.ts`](../server/api/articles.get.ts) and
[`server/api/sources.get.ts`](../server/api/sources.get.ts). Both read D1 and
answer JSON. They include only sources with `enabled = 1`.

Dates are Unix seconds.

## `GET /api/articles`

Returns one page of articles, newest first (`published_at DESC`). A page holds
20 articles.

| Parameter   | Meaning                                                                |
| ----------- | ---------------------------------------------------------------------- |
| `page`      | Page number, from 1. A missing or invalid value counts as 1.           |
| `source_id` | Comma-separated source ids, such as `10,11`. An invalid id is dropped. |
| `q`         | Text that must appear in the title or the summary (`LIKE`).            |

`q` does not escape `%` or `_`, which `LIKE` treats as wildcards.

```sh
curl 'http://localhost:8787/api/articles?source_id=8&page=1'
```

```json
{
  "articles": [
    {
      "id": 142,
      "title": "Want to develop your skills?",
      "link": "https://home.cern/want-to-develop-your-skills/",
      "description": "At CERN, the Learning and Development service provides …",
      "author": "Anais Schaeffer",
      "image": null,
      "published_at": 1790859959,
      "source_id": 8,
      "source_name": "CERN",
      "category": "ciencia",
      "language": "en"
    }
  ],
  "page": 1,
  "pageSize": 20
}
```

The response has no total. A page with fewer than 20 articles is the last one.

## `GET /api/sources`

Returns the enabled sources, sorted by name.

```sh
curl 'http://localhost:8787/api/sources'
```

```json
{
  "sources": [
    {
      "id": 12,
      "name": "@asdfpucp",
      "category": "institucional",
      "language": "es",
      "last_fetched_at": 1791107701,
      "last_error": null,
      "article_count": 8
    }
  ]
}
```

`last_fetched_at` is the last successful check (`null` if there has been none).
`last_error` is the reason for the last failed check. See
[failures](sources.md#failures). `article_count` counts all the source's
articles.
