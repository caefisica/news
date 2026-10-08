# Web app

The interface is a Nuxt app in [`app/`](../app). Its text is in Spanish. It
reads the [API](api.md) and has no write route.

| Route        | Shows                                                                      |
| ------------ | -------------------------------------------------------------------------- |
| `/`          | The articles, with category, source and text filters.                      |
| `/guardados` | The articles saved in this browser.                                        |
| `/sources`   | Each source's last check and failure. See [failures](sources.md#failures). |
| `/about`     | What the site is, how it works and how to suggest a source.                |

## Articles and filters

[`article-feed.vue`](../app/components/article-feed.vue) requests 20 articles at
a time. It requests the next page when the end of the list scrolls into view.

Filters live in the URL, so a filtered view can be shared
([`use-feed-filters.ts`](../app/composables/use-feed-filters.ts)):

| Parameter   | Meaning                                                  |
| ----------- | -------------------------------------------------------- |
| `categoria` | Comma-separated categories.                              |
| `fuente`    | Comma-separated source ids.                              |
| `q`         | Search text. It updates 300 ms after the last keystroke. |

The API has no category filter. The app turns the selected categories and
sources into the sources that match both, and sends their ids as `source_id`. A
selection that matches no source sends no request.

Articles are grouped under day headings (`Hoy`, `Ayer`, `Esta semana`, then one
heading per month). Days and times use the `America/Lima` time zone, and the
week starts on Monday ([`dates.ts`](../app/utils/dates.ts)). An article with no
valid date goes under `Sin fecha`.

## Keyboard shortcuts

[`shortcuts-dialog.vue`](../app/components/shortcuts-dialog.vue) lists them for
the reader; `?` opens it.

| Key      | Action                                     |
| -------- | ------------------------------------------ |
| `j`, `↓` | Select the next article.                   |
| `k`, `↑` | Select the previous article.               |
| `Enter`  | Open the original of the selected article. |
| `s`      | Save or unsave the selected article.       |
| `/`      | Focus the search field.                    |
| `Esc`    | Clear the selection, then the search text. |

A shortcut does nothing while the reader types in a field, holds `Ctrl`, `Meta`
or `Alt`, or has a dialog or the menu drawer open
([`keys.ts`](../app/utils/keys.ts)).

## What the browser stores

The app writes three `localStorage` keys. Nothing is sent to the server.

| Key                 | Holds                                                        |
| ------------------- | ------------------------------------------------------------ |
| `nr:saved-articles` | The saved articles, whole, so `/guardados` needs no request. |
| `nr:detail-width`   | The width of the article panel, between 320 and 720 pixels.  |
| `nuxt-color-mode`   | The theme choice, kept by `@nuxtjs/color-mode`.              |

Saved articles stay in one browser and do not follow the reader to another
device. On load, the app drops entries that a row cannot render
([`use-saved-articles.ts`](../app/composables/use-saved-articles.ts)).
