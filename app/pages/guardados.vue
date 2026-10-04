<script setup lang="ts">
useSeoMeta({
  title: "Guardados",
  description: "Los artículos que guardaste en este navegador.",
});

const { saved, ready } = useSavedArticles();

// Day headings need the list newest first, whatever order the articles were saved in.
const articles = computed(() =>
  saved.value.toSorted((a, b) => (b.published_at ?? 0) - (a.published_at ?? 0)),
);

const statusText = computed(() => {
  if (!ready.value) return "Cargando guardados.";
  const count = saved.value.length;
  if (count === 0) return "No tienes artículos guardados.";
  return `${count} ${count === 1 ? "artículo guardado" : "artículos guardados"}.`;
});
</script>

<template>
  <div class="view">
    <ViewToolbar title="Guardados">
      <p class="toolbar-note">Solo en este navegador</p>
    </ViewToolbar>

    <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ statusText }}</p>

    <ArticleBrowser :articles="articles">
      <template v-if="!ready" #state>
        <ArticleSkeleton :rows="3" />
      </template>

      <template v-else-if="saved.length === 0" #state>
        <StatePanel
          icon="solar:bookmark-linear"
          title="Todavía no guardaste nada"
          text="Usa el marcador de un artículo, o la tecla S, para guardarlo y encontrarlo aquí. Los guardados se quedan en este navegador."
        >
          <NuxtLink to="/" class="btn btn-primary">Ver artículos</NuxtLink>
        </StatePanel>
      </template>
    </ArticleBrowser>
  </div>
</template>

<style scoped>
.toolbar-note {
  color: var(--text-3);
  font-size: var(--text-xs);
  white-space: nowrap;
}
</style>
