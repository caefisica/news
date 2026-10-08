# Sources

A source is one row of the `sources` table (see [database](database.md)). Two
columns decide how it is processed:

- `kind` says how the items are fetched: `feed` or `instagram`.
- `parser` says how each item is read.

The `SourceKind` type and the table of fetchers are in
[`types.ts`](../packages/feeds/src/types.ts) and
[`fetchers.ts`](../packages/feeds/src/fetchers.ts). To register a new source, go
to [adding a source](adding-a-source.md).

## Feeds

`kind = 'feed'` is the default. [`fetch.ts`](../packages/feeds/src/fetch.ts)
downloads the URL with the user agent `caefisica-news-reader/1.0` and a timeout
of 10 seconds. It fails in these cases:

- The source answers with a status code that is not 2xx.
- The response contains none of `<rss`, `<feed` or `<rdf:RDF`. This rejects the
  HTML challenge pages that answer 200.

The XML is read with regular expressions and no external dependency. A response
containing `<entry` is an Atom feed. Otherwise the reader takes the RSS `<item>`
elements. The item's `guid` is its `<guid>`, else its `<id>`, else its link.
That value, with the source, is the article's unique key.

## Instagram accounts

`kind = 'instagram'` reads the latest posts of a public account. The code is in
[`packages/feeds/src/instagram/`](../packages/feeds/src/instagram).

The request is anonymous. It uses no login or cookies, makes one GraphQL request
per account per check, and asks for the 12 most recent posts. Its header and
form values identify nobody.

- **Account.** The source stores `https://www.instagram.com/<account>/`. The
  username comes from the URL and must match `[A-Za-z0-9._]{1,30}`.
- **Own posts.** Only posts whose owner is the account are kept. Collaboration
  posts that belong to other accounts are skipped.
- **Link.** It is `/p/<code>/`, or `/reel/<code>/` for a reel.
- **Date.** The grid has no date. The date is computed from the post's
  shortcode, which encodes the creation time
  ([`shortcodeTime`](../packages/feeds/src/instagram/fetch.ts)). For a reel it
  can be up to one minute earlier than the time Instagram shows.
- **Image.** The post's cover image (`display_uri`).

The query uses a persisted-query identifier (`docId`) in
[`graphql.ts`](../packages/feeds/src/instagram/graphql.ts). Instagram retires
these identifiers from time to time. When that happens, the source fails with
the message
`Instagram rechazó la consulta. Puede que el identificador de la consulta haya cambiado.`
and `docId` needs an update.

## Parsers

The registry is in [`parsers/index.ts`](../packages/feeds/src/parsers/index.ts).
A null or unknown key uses `identity`.

| Parser      | Use it for                                                                  |
| ----------- | --------------------------------------------------------------------------- |
| `identity`  | Standard RSS and Atom feeds.                                                |
| `blogspot`  | Blogger feeds. It strips the "Posted by" and "No comments" footers.         |
| `gobpe`     | `gob.pe` feeds. It skips collection pages and links to the article.         |
| `instagram` | Instagram posts. It builds the title from the first non-empty caption line. |

Every parser returns a normalized article (`guid`, `title`, `link`,
`description`, `author`, `image`, `published_at`).

- `identity` strips HTML tags from the summary. A summary longer than 300
  characters is cut there and ends with `…`. The date comes from `pubDate`,
  `published` or `updated`, in Unix seconds. When the item has none, the date is
  `NULL`. It sets no image.
- `gobpe` drops the items without a `pubDate`, because they are collection
  pages. It gives them an empty `guid`, so they are not stored. It uses the
  `guid` as the link when that is a URL, because the feed's `<link>` points to
  the collection.
- `instagram` takes the first non-empty line of the caption as the title. A line
  of up to 120 characters is the title as is. A longer line is cut in one of two
  ways:
  - At the last sentence end within the first 120 characters, if at least 40
    characters come before it. A sentence end is `.`, `!`, `?` or `…` followed
    by whitespace. The title keeps that mark and gets no `…`. A full stop after
    one to three letters, such as `Dr.` or `Ing.`, does not count.
  - Otherwise at the last space, with trailing spaces, commas, semicolons,
    colons and dashes removed. The title then ends with `…`. A line with no
    space is cut at 120 characters.

  With no caption, the title is `Publicación de @<account>`. The summary is the
  full caption.

## Polling cadence

The coordinator runs every 15 minutes (see [architecture](architecture.md)).
[`schedule.ts`](../packages/feeds/src/schedule.ts) decides which sources are due
on each run:

| `kind`      | Cadence          |
| ----------- | ---------------- |
| `feed`      | Every 15 minutes |
| `instagram` | Every hour       |

Instagram rate-limits data-center IPs, and a Worker uses one. So its accounts
are checked less often.

`dueSources` divides the scheduled time into 15-minute intervals. A source is
due when that interval number is divisible by the number of intervals in its
period: 1 for a feed and 4 for Instagram. So accounts are checked on the hour
(UTC). `dueSources` keeps no state. A failed check is not retried until the
source's next scheduled check. The constants that set the periods are in
`schedule.ts`, with the rules they must follow.

## Failures

A failed check deletes no articles and does not count as a successful check.
[`process.ts`](../packages/feeds/src/process.ts) logs `fetch failed` with the
reason, stores the reason in `sources.last_error` and leaves `last_fetched_at`
at the last successful check.

The reasons are Spanish messages for the reader, thrown as `SourceError`
([`errors.ts`](../packages/feeds/src/errors.ts)). Any other error stores
`No se pudo revisar la fuente por un error inesperado.`. The code throws a
`SourceError` in these cases:

- Feed: an HTTP response that is not 2xx
  ([`fetch.ts`](../packages/feeds/src/fetch.ts)), or a page that is not an RSS
  or Atom feed.
- Instagram, before the request
  ([`instagram/fetch.ts`](../packages/feeds/src/instagram/fetch.ts)): the source
  URL is not an account URL.
- Instagram, in the request
  ([`instagram/graphql.ts`](../packages/feeds/src/instagram/graphql.ts)): no
  connection, a redirect to the login page (302), a rate limit (429), another
  HTTP rejection, an empty response, a response that is not JSON, a request that
  asks for login, a rate-limit error in the body, a rejected query (see
  `docId`), an account that does not exist, or a response in an unexpected
  format.
- Instagram, in the posts: the account returns no posts of its own, a post has
  no code or no image, or a post code is not a valid shortcode.

The `/sources` page ([`app/pages/sources.vue`](../app/pages/sources.vue)) lists
the enabled sources with their category, their article count and the last
successful check (`Todavía no` if there has been none). When `last_error` has a
value, the page shows `No se pudo revisar:` and the reason under the name. The
footnote repeats the cadence, built from the constants in `schedule.ts`. The
next successful check clears `last_error`.
