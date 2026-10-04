import type { RawItem, NormalizedArticle } from "../types";

const TITLE_MAX = 120;
// A sentence shorter than this leaves a title too thin to tell posts apart.
const SENTENCE_MIN = 40;

// A full stop after one to three letters is an abbreviation such as "Dr." or "Ing.".
const SENTENCE_END = /(?:(?<!(?:^|[^\p{L}])\p{L}{1,3})\.|[!?…])(?=\s)/gu;

// The title is the first line of the caption. A longer line ends at its last
// sentence end, or else at a word. Length counts characters, not UTF-16 units,
// so a cut never splits an emoji.
function title(caption: string, account: string): string {
  const line = caption
    .split(/\r?\n/u)
    .map((text) => text.trim())
    .find(Boolean);
  if (!line) {
    return `Publicación de @${account}`;
  }

  const chars = Array.from(line);
  if (chars.length <= TITLE_MAX) {
    return line;
  }

  const head = chars.slice(0, TITLE_MAX + 1).join("");
  const sentenceEnd = [...head.matchAll(SENTENCE_END)].at(-1)?.index;
  if (sentenceEnd !== undefined && sentenceEnd >= SENTENCE_MIN) {
    return head.slice(0, sentenceEnd + 1);
  }

  const space = head.lastIndexOf(" ");
  const words = space > 0 ? head.slice(0, space) : chars.slice(0, TITLE_MAX).join("");
  return `${words.replace(/[\s,;:–-]+$/u, "")}…`;
}

export function instagramParser(item: RawItem): NormalizedArticle {
  const caption = item.description?.trim() ?? "";
  const published = item.published ? Date.parse(item.published) : Number.NaN;

  return {
    guid: item.guid ?? "",
    title: title(caption, item.author ?? ""),
    link: item.link ?? "",
    description: caption || null,
    author: null,
    image: item.image ?? null,
    published_at: Number.isNaN(published) ? null : Math.floor(published / 1000),
  };
}
