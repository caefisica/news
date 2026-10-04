<script setup lang="ts">
import type { Article, Source } from "~/types/news";

const PAGE_SIZE = 20;
const SKELETON_COUNT = 6;

const props = defineProps<{ sources: Source[] }>();

const requestFetch = useRequestFetch();
const { q, categories, sourceIds, active, allowedSourceIds, clear } = useFeedFilters(
  toRef(props, "sources"),
);

const params = computed(() => ({
  q: q.value || undefined,
  source_id: allowedSourceIds.value?.join(","),
}));

// If the active category and source filters have no intersection, skip the API request.
const nothingAllowed = computed(() => allowedSourceIds.value?.length === 0);

function fetchPage(page: number, query = params.value) {
  return requestFetch<{ articles: Article[] }>("/api/articles", { query: { page, ...query } });
}

const { data, status, error, refresh } = useAsyncData(
  "feed",
  () => (nothingAllowed.value ? Promise.resolve({ articles: [] }) : fetchPage(1)),
  { watch: [params] },
);

// useAsyncData provides the server-rendered first page. Later pages are appended here.
const laterArticles = ref<Article[]>([]);
const nextPage = ref(2);
const exhausted = ref(false);
const loadingMore = ref(false);
const moreFailed = ref(false);
const sentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | undefined;
let generation = 0;

const articles = computed(() => [...(data.value?.articles ?? []), ...laterArticles.value]);
const hasMore = computed(
  () => !exhausted.value && (data.value?.articles.length ?? 0) === PAGE_SIZE,
);

// A new first page replaces the list, so a page still in flight is stale.
watch(data, () => {
  generation++;
  laterArticles.value = [];
  nextPage.value = 2;
  exhausted.value = false;
  loadingMore.value = false;
  moreFailed.value = false;
});

const pending = computed(() => status.value === "pending");
const firstLoad = computed(() => pending.value && articles.value.length === 0);
const failed = computed(() => error.value !== undefined && error.value !== null);

async function loadMore() {
  if (loadingMore.value || moreFailed.value || !hasMore.value || pending.value) return;
  const current = generation;
  loadingMore.value = true;
  try {
    const next = await fetchPage(nextPage.value);
    if (current !== generation) return;
    laterArticles.value = [...laterArticles.value, ...next.articles];
    nextPage.value++;
    exhausted.value = next.articles.length < PAGE_SIZE;
  } catch {
    if (current === generation) moreFailed.value = true;
  } finally {
    if (current === generation) {
      loadingMore.value = false;
      watchSentinel(sentinel.value);
    }
  }
}

function retryMore() {
  moreFailed.value = false;
  void loadMore();
}

// Observing again reports the sentinel even if it never left the viewport,
// so a short page that does not fill the screen still loads the next one.
function watchSentinel(el: HTMLElement | null) {
  observer?.disconnect();
  if (el) observer?.observe(el);
}

watch(sentinel, watchSentinel);

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) void loadMore();
    },
    { rootMargin: "200px" },
  );
  watchSentinel(sentinel.value);
});

onBeforeUnmount(() => observer?.disconnect());

const plural = (count: number) => `${count} ${count === 1 ? "artículo" : "artículos"}`;

const listFormat = new Intl.ListFormat("es", { style: "long", type: "conjunction" });

// Names the filters that produced no results, e.g. «la categoría Becas y la fuente Naukas».
const emptyText = computed(() => {
  const parts: string[] = [];
  if (q.value) parts.push(`la búsqueda «${q.value}»`);
  if (categories.value.length > 0) {
    const labels = categories.value.map((id) => categoryLabel(id) ?? id);
    parts.push(
      `${labels.length === 1 ? "la categoría" : "las categorías"} ${listFormat.format(labels)}`,
    );
  }
  if (sourceIds.value.length > 0) {
    const names = sourceIds.value.map(
      (id) => props.sources.find((source) => source.id === id)?.name ?? String(id),
    );
    parts.push(`${names.length === 1 ? "la fuente" : "las fuentes"} ${listFormat.format(names)}`);
  }
  if (parts.length === 0) return "Las fuentes se actualizan cada 15 minutos.";
  return `No hay artículos para ${listFormat.format(parts)}. Prueba con menos filtros.`;
});

const statusText = computed(() => {
  if (failed.value) return "No se pudieron cargar los artículos.";
  if (firstLoad.value) return "Cargando artículos.";
  if (pending.value) return "Actualizando resultados.";
  if (articles.value.length === 0) return "Sin resultados.";
  const count = plural(articles.value.length);
  return hasMore.value ? `${count} cargados.` : `${count}. No hay más.`;
});
</script>

<template>
  <div class="feed" :aria-busy="pending">
    <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ statusText }}</p>

    <StatePanel
      v-if="failed"
      tone="danger"
      title="No se pudieron cargar los artículos"
      text="Revisa tu conexión e inténtalo de nuevo."
    >
      <button type="button" class="btn btn-primary" @click="refresh()">Reintentar</button>
    </StatePanel>

    <div v-else-if="firstLoad" class="card-grid">
      <ArticleSkeleton v-for="n in SKELETON_COUNT" :key="n" />
    </div>

    <StatePanel v-else-if="articles.length === 0" title="Sin resultados" :text="emptyText">
      <button v-if="active" type="button" class="btn" @click="clear">Limpiar filtros</button>
    </StatePanel>

    <template v-else>
      <div class="card-grid" :class="{ stale: pending }">
        <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
      </div>

      <div ref="sentinel" class="sentinel" />

      <p v-if="loadingMore" class="feed-note">Cargando más artículos…</p>
      <div v-else-if="moreFailed" class="feed-note feed-note-danger">
        <span>No se pudieron cargar más artículos.</span>
        <button type="button" class="btn" @click="retryMore">Reintentar</button>
      </div>
      <p v-else-if="!hasMore" class="feed-note">No hay más artículos.</p>
    </template>
  </div>
</template>

<style scoped>
.stale {
  opacity: var(--opacity-pending);
}

.sentinel {
  height: 1px;
}

.feed-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding-block: var(--space-6);
  color: var(--text-2);
  font-size: var(--text-sm);
  text-align: center;
}

.feed-note-danger {
  flex-wrap: wrap;
  color: var(--danger);
}
</style>
