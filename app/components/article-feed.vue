<script setup lang="ts">
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

const props = defineProps<{
  initialArticles: Article[];
  activeSourceIds: number[];
}>();

const articles = ref<Article[]>(props.initialArticles);
const page = ref(1);
const hasMore = ref(props.initialArticles.length === 20);
const loading = ref(false);
const sentinel = ref<HTMLElement | null>(null);

watch(
  () => props.activeSourceIds,
  async () => {
    page.value = 1;
    articles.value = [];
    hasMore.value = true;
    await loadMore();
  },
);

async function loadMore() {
  if (loading.value || !hasMore.value) return;
  loading.value = true;

  const sourceParam =
    props.activeSourceIds.length > 0 ? `&source_id=${props.activeSourceIds.join(",")}` : "";

  const data = await $fetch<{ articles: Article[]; page: number }>(
    `/api/articles?page=${page.value}${sourceParam}`,
  );

  if (data.articles.length < 20) hasMore.value = false;
  articles.value = page.value === 1 ? data.articles : [...articles.value, ...data.articles];
  page.value++;
  loading.value = false;
}

onMounted(() => {
  if (!sentinel.value) return;
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) loadMore();
    },
    { rootMargin: "200px" },
  );
  observer.observe(sentinel.value);
  onBeforeUnmount(() => observer.disconnect());
});
</script>

<template>
  <div class="feed">
    <div v-if="articles.length === 0 && !loading" class="empty label">
      No hay artículos. Las fuentes se actualizan cada 15 min.
    </div>

    <div class="feed-grid">
      <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
    </div>

    <div ref="sentinel" class="sentinel" />

    <div v-if="loading" class="status label">Cargando...</div>

    <div v-if="!hasMore && articles.length > 0" class="status label">Fin del feed</div>
  </div>
</template>

<style scoped>
.feed-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-sm);
}

@media (min-width: 768px) {
  .feed-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .feed-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.sentinel {
  height: 1px;
}

.status,
.empty {
  text-align: center;
  color: var(--color-text-muted);
  padding-block: var(--spacing-3xl);
}
</style>
