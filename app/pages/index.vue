<script setup lang="ts">
interface Source {
  id: number;
  name: string;
  category: string | null;
}

interface Article {
  id: number;
  title: string;
  link: string;
  description: string | null;
  author: string | null;
  published_at: number | null;
  source_name: string;
  category: string | null;
}

// SSR uses request-scoped fetch to forward Cloudflare bindings to API handlers.
const requestFetch = useRequestFetch();

const { data, refresh } = await useAsyncData("feed-init", () =>
  Promise.all([
    requestFetch<{ sources: Source[] }>("/api/sources"),
    requestFetch<{ articles: Article[] }>("/api/articles?page=1"),
  ]),
);

const sources = computed(() => data.value?.[0].sources ?? []);
const initialArticles = computed(() => data.value?.[1].articles ?? []);

const { visibleIds } = useSourcePrefs();
const activeSourceIds = computed(() => visibleIds(sources.value.map((s) => s.id)));

onMounted(async () => {
  if (!data.value) {
    await refresh();
  }
});
</script>

<template>
  <div class="container feed-page">
    <SourceFilter v-if="sources.length > 0" :sources="sources" />
    <ArticleFeed :initial-articles="initialArticles" :active-source-ids="activeSourceIds" />
  </div>
</template>

<style scoped>
.feed-page {
  padding-block: var(--spacing-3xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}
</style>
