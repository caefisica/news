<script setup lang="ts">
import type { Source } from "~/types/news";

useSeoMeta({
  title: "Fuentes",
  description: "De dónde salen los artículos de RSS para Físicos.",
});

// SSR uses request-scoped fetch to forward Cloudflare bindings to API handlers.
const requestFetch = useRequestFetch();

const { data, error, refresh } = await useAsyncData("sources-page", () =>
  requestFetch<{ sources: Source[] }>("/api/sources"),
);

const sources = computed(() => data.value?.sources ?? []);

const formatter = new Intl.DateTimeFormat("es-PE", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Lima",
});

function updated(ts: number | null): string {
  return ts ? formatter.format(new Date(ts * 1000)) : "todavía no";
}

function count(n: number): string {
  return `${n} ${n === 1 ? "artículo" : "artículos"}`;
}
</script>

<template>
  <div class="container page">
    <header class="page-header">
      <h1 class="page-title">Fuentes</h1>
      <p class="page-lead">Los sitios de donde salen los artículos. Se revisan cada 15 minutos.</p>
    </header>

    <StatePanel
      v-if="error"
      tone="danger"
      title="No se pudieron cargar las fuentes"
      text="Revisa tu conexión e inténtalo de nuevo."
    >
      <button type="button" class="btn btn-primary" @click="refresh()">Reintentar</button>
    </StatePanel>

    <StatePanel v-else-if="sources.length === 0" title="Todavía no hay fuentes" />

    <ul v-else class="card-grid sources-list">
      <li v-for="source in sources" :key="source.id" class="surface source-card">
        <div class="source-head">
          <h2 class="source-name">{{ source.name }}</h2>
          <span v-if="categoryLabel(source.category)" class="tag">
            {{ categoryLabel(source.category) }}
          </span>
        </div>
        <p class="source-meta">
          {{ count(source.article_count) }} · actualizada {{ updated(source.last_fetched_at) }}
        </p>
        <NuxtLink :to="{ path: '/', query: { fuente: source.id } }" class="btn source-link">
          Ver artículos
          <span class="sr-only">de {{ source.name }}</span>
        </NuxtLink>
      </li>
    </ul>

    <p class="suggest">
      ¿Falta una fuente?
      <a
        href="https://github.com/caefisica/news/issues/new?template=suggest-source.md"
        target="_blank"
        rel="noopener noreferrer"
        class="link"
        >Sugiérela en GitHub<span class="sr-only"> (se abre en una pestaña nueva)</span></a
      >
    </p>
  </div>
</template>

<style scoped>
.sources-list {
  list-style: none;
}

.source-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
}

.source-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}

.source-name {
  font-size: var(--text-md);
  font-weight: 500;
  line-height: var(--leading-tight);
}

.source-meta {
  color: var(--text-2);
  font-size: var(--text-sm);
}

.source-link {
  margin-top: var(--space-1);
}

.suggest {
  margin-top: var(--space-7);
  color: var(--text-2);
  font-size: var(--text-sm);
}
</style>
