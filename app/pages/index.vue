<script setup lang="ts">
useSeoMeta({
  title: "Becas y noticias de física",
  description: "Becas, convocatorias y lecturas de física para estudiantes en Perú.",
});

const { sources, error, refresh } = await useSources();
const { title, setQuery } = useFeedFilters(sources);
</script>

<template>
  <div class="view">
    <ViewToolbar :title="title">
      <FeedSearch :sources="sources" />
    </ViewToolbar>

    <StatePanel
      v-if="error"
      tone="danger"
      icon="solar:cloud-cross-linear"
      title="No se pudo cargar la lista de fuentes"
      text="Revisa tu conexión e inténtalo de nuevo."
    >
      <button type="button" class="btn btn-primary" @click="refresh()">Reintentar</button>
    </StatePanel>

    <ArticleFeed v-else :sources="sources" @escape="setQuery('')" />
  </div>
</template>
