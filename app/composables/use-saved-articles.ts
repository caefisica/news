import type { Article } from "~/types/news";

const STORAGE_KEY = "nr:saved-articles";

function load(): Article[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
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
