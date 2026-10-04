import type { Source } from "~/types/news";

// The sidebar, the feed and the sources page share one request.
export async function useSources() {
  // SSR uses request-scoped fetch to forward Cloudflare bindings to API handlers.
  const requestFetch = useRequestFetch();
  const result = await useAsyncData("sources", () =>
    requestFetch<{ sources: Source[] }>("/api/sources"),
  );
  const sources = computed(() => result.data.value?.sources ?? []);
  return { ...result, sources };
}
