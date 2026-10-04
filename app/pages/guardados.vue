<script setup lang="ts">
useSeoMeta({
  title: "Guardados",
  description: "Los artículos que guardaste en este navegador.",
});

const { saved, ready } = useSavedArticles();

const statusText = computed(() => {
  if (!ready.value) return "Cargando guardados.";
  const count = saved.value.length;
  if (count === 0) return "No tienes artículos guardados.";
  return `${count} ${count === 1 ? "artículo guardado" : "artículos guardados"}.`;
});
</script>

<template>
  <div class="container page">
    <header class="page-header">
      <h1 class="page-title">Guardados</h1>
      <p class="page-lead">Se guardan solo en este navegador, no en una cuenta.</p>
    </header>

    <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ statusText }}</p>

    <div v-if="!ready" class="card-grid">
      <ArticleSkeleton v-for="n in 3" :key="n" />
    </div>

    <StatePanel
      v-else-if="saved.length === 0"
      title="Todavía no guardaste nada"
      text="Usa el marcador de cada artículo para guardarlo y encontrarlo aquí."
    >
      <NuxtLink to="/" class="btn btn-primary">Ver artículos</NuxtLink>
    </StatePanel>

    <div v-else class="card-grid">
      <ArticleCard v-for="article in saved" :key="article.id" :article="article" />
    </div>
  </div>
</template>
