<script setup lang="ts">
import type { Article } from "~/types/news";

const props = defineProps<{ article: Article }>();

const { isSaved, toggle } = useSavedArticles();
const saved = computed(() => isSaved(props.article.id));

const published = computed(() => {
  const ts = props.article.published_at;
  if (!ts) return null;
  const date = new Date(ts * 1000);
  return {
    iso: date.toISOString(),
    label: new Intl.DateTimeFormat("es-PE", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "America/Lima",
    }).format(date),
  };
});
</script>

<template>
  <article class="surface article-card">
    <h2 class="title">
      <a :href="article.link" target="_blank" rel="noopener noreferrer" class="title-link">
        {{ article.title }}
        <span class="sr-only">(se abre en una pestaña nueva)</span>
      </a>
    </h2>
    <button
      class="btn btn-ghost btn-icon bookmark"
      type="button"
      :aria-pressed="saved"
      :aria-label="`Guardar: ${article.title}`"
      @click="toggle(article)"
    >
      <Icon :name="saved ? 'solar:bookmark-bold' : 'solar:bookmark-linear'" size="16" />
    </button>
    <p v-if="article.description" class="description">{{ article.description }}</p>
    <p class="meta">
      <span class="source">{{ article.source_name }}</span>
      <span
        v-if="categoryLabel(article.category)"
        class="tag"
        :class="{ 'tag-accent': article.category === 'becas' }"
      >
        {{ categoryLabel(article.category) }}
      </span>
      <time v-if="published" :datetime="published.iso" class="date">{{ published.label }}</time>
    </p>
  </article>
</template>

<style scoped>
.article-card {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  align-content: start;
  column-gap: var(--space-3);
  row-gap: var(--space-2);
  height: 100%;
  padding: var(--space-4) var(--space-4) var(--space-4) var(--space-5);
  transition:
    background-color var(--duration-fast) var(--ease),
    border-color var(--duration-fast) var(--ease);
}

.article-card:hover {
  background: var(--surface-2);
  border-color: var(--border-strong);
}

.title {
  font-size: var(--text-md);
  font-weight: 500;
  line-height: var(--leading-tight);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-block: var(--space-2);
}

/* The pseudo-element makes the title link cover the card while the bookmark stays clickable. */
.title-link::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
}

.title-link:focus-visible {
  outline: none;
}

.title-link:focus-visible::after {
  outline: var(--focus-ring);
  outline-offset: var(--focus-offset);
}

.bookmark {
  position: relative;
  z-index: 1;
  margin-top: calc(var(--space-1) * -1);
  color: var(--text-2);
}

.bookmark[aria-pressed="true"] {
  color: var(--accent);
}

.description {
  grid-column: 1 / -1;
  overflow: hidden;
  color: var(--text-2);
  font-size: var(--text-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-3);
  margin-top: var(--space-1);
  font-size: var(--text-xs);
}

.source {
  color: var(--text-2);
  font-weight: 500;
}

.date {
  color: var(--text-3);
}
</style>
