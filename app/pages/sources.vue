<script setup lang="ts">
import { dotClass } from "~/utils/sources";

useSeoMeta({
  title: "Fuentes",
  description: "De dónde salen los artículos de RSS para Físicos.",
});

const { sources, error, refresh } = await useSources();

const formatter = new Intl.DateTimeFormat("es-PE", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "America/Lima",
});

const languages = new Intl.DisplayNames("es", { type: "language" });

function languageName(code: string): string {
  return languages.of(code) ?? code;
}

function fetched(ts: number | null): string {
  return ts ? formatter.format(new Date(ts * 1000)) : "Todavía no";
}
</script>

<template>
  <div class="view">
    <ViewToolbar title="Fuentes">
      <a
        href="https://github.com/caefisica/news/issues/new?template=suggest-source.md"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-sm"
      >
        <Icon name="solar:add-square-linear" size="16" />
        Sugerir fuente
        <span class="sr-only">(se abre en una pestaña nueva)</span>
      </a>
    </ViewToolbar>

    <div class="view-body">
      <StatePanel
        v-if="error"
        tone="danger"
        icon="solar:cloud-cross-linear"
        title="No se pudieron cargar las fuentes"
        text="Revisa tu conexión e inténtalo de nuevo."
      >
        <button type="button" class="btn btn-primary" @click="refresh()">Reintentar</button>
      </StatePanel>

      <StatePanel
        v-else-if="sources.length === 0"
        icon="solar:list-linear"
        title="Todavía no hay fuentes"
      />

      <table v-else class="table">
        <caption class="sr-only">
          Fuentes revisadas cada 15 minutos
        </caption>
        <thead>
          <tr>
            <th scope="col">Fuente</th>
            <th scope="col" class="col-category">Categoría</th>
            <th scope="col" class="col-number">Artículos</th>
            <th scope="col" class="col-date">Última revisión</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="source in sources" :key="source.id">
            <th scope="row">
              <NuxtLink :to="{ path: '/', query: viewQuery({ sourceId: source.id }) }" class="name">
                <span class="dot" :class="dotClass(source.id)" />
                {{ source.name }}
              </NuxtLink>
              <span v-if="source.language !== 'es'" class="tag language">
                {{ languageName(source.language) }}
              </span>
            </th>
            <td class="col-category">
              <span v-if="categoryLabel(source.category)" class="tag">
                {{ categoryLabel(source.category) }}
              </span>
            </td>
            <td class="col-number">{{ source.article_count }}</td>
            <td class="col-date">{{ fetched(source.last_fetched_at) }}</td>
          </tr>
        </tbody>
      </table>

      <p class="table-note">Revisamos cada fuente cada 15 minutos.</p>
    </div>
  </div>
</template>

<style scoped>
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

th,
td {
  height: var(--row-h);
  padding-inline: var(--space-4);
  border-bottom: 1px solid var(--border);
  text-align: left;
  white-space: nowrap;
}

thead th {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  height: var(--group-h);
  background: var(--surface-2);
  color: var(--text-2);
  font-size: var(--text-xs);
  font-weight: 500;
}

th:first-child {
  padding-left: var(--space-5);
}

tbody th {
  width: 100%;
  font-weight: 400;
  white-space: normal;
}

tbody tr:hover {
  background: var(--hover-bg);
}

.name {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  min-height: var(--hit-sm);
  color: var(--text-1);
}

.name:hover {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: var(--underline-offset);
}

.language {
  margin-left: var(--space-2);
}

.col-number {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.col-date {
  color: var(--text-2);
  font-variant-numeric: tabular-nums;
}

.table-note {
  padding: var(--space-4) var(--space-5);
  color: var(--text-3);
  font-size: var(--text-xs);
}

@media (max-width: 767px) {
  .col-category {
    display: none;
  }

  th,
  td {
    padding-inline: var(--space-2);
  }

  th:first-child {
    padding-left: var(--space-4);
  }

  td:last-child {
    padding-right: var(--space-4);
  }

  .col-date {
    white-space: normal;
  }
}
</style>
