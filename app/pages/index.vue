<script setup lang="ts">
import type { Source } from "~/types/news";

useSeoMeta({
  title: "Becas y noticias de física",
  description: "Becas, convocatorias y lecturas de física para estudiantes en Perú.",
});

// SSR uses request-scoped fetch to forward Cloudflare bindings to API handlers.
const requestFetch = useRequestFetch();

const { data, error, refresh } = await useAsyncData("sources-filter", () =>
  requestFetch<{ sources: Source[] }>("/api/sources"),
);

const sources = computed(() => data.value?.sources ?? []);
</script>

<template>
  <div class="container page">
    <header class="page-header">
      <h1 class="page-title">Becas y noticias de física</h1>
      <p class="page-lead">Convocatorias, becas y lecturas para estudiantes de física en Perú.</p>
    </header>

    <StatePanel
      v-if="error"
      tone="danger"
      title="No se pudo cargar la lista de fuentes"
      text="Revisa tu conexión e inténtalo de nuevo."
    >
      <button type="button" class="btn btn-primary" @click="refresh()">Reintentar</button>
    </StatePanel>

    <div v-else class="feed-page">
      <FeedToolbar :sources="sources" />
      <ArticleFeed :sources="sources" />
    </div>
  </div>
</template>

<style scoped>
.feed-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
</style>
