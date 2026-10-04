import type { Article } from "~/types/news";
import { isValidTimestamp } from "~/utils/dates";

const STORAGE_KEY = "nr:saved-articles";

// Storage is user-editable, so keep only entries a row can render.
function isArticle(value: unknown): value is Article {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "number" &&
    typeof item.title === "string" &&
    typeof item.link === "string" &&
    typeof item.source_id === "number" &&
    typeof item.source_name === "string" &&
    (item.published_at === null || isValidTimestamp(item.published_at))
  );
}

export function parseSaved(raw: string | null): Article[] {
  try {
    const parsed: unknown = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => isArticle(item)) : [];
  } catch {
    return [];
  }
}

function load(): Article[] {
  try {
    return parseSaved(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

function persist(articles: Article[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  } catch {
    // Storage full or blocked: the list still works for this session.
  }
}

// Keep saved articles empty until hydration so server and client render the same markup.
export function useSavedArticles() {
  const saved = useState<Article[]>("saved-articles", () => []);
  const ready = useState("saved-articles-ready", () => false);

  onNuxtReady(() => {
    if (ready.value) return;
    saved.value = load();
    ready.value = true;
    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY) saved.value = load();
    });
  });

  function isSaved(id: number): boolean {
    return saved.value.some((article) => article.id === id);
  }

  function toggle(article: Article) {
    if (!ready.value) return;
    saved.value = isSaved(article.id)
      ? saved.value.filter((item) => item.id !== article.id)
      : [article, ...saved.value];
    persist(saved.value);
  }

  return { saved, ready, isSaved, toggle };
}
