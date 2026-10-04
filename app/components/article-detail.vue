<script setup lang="ts">
import type { Article } from "~/types/news";
import { isoDate, longDate } from "~/utils/dates";
import { dotClass } from "~/utils/sources";

const props = defineProps<{ article: Article | null }>();

const { isSaved, toggle } = useSavedArticles();
const saved = computed(() => (props.article ? isSaved(props.article.id) : false));
const category = computed(() => categoryLabel(props.article?.category ?? null));
const date = computed(() => longDate(props.article?.published_at ?? null));
const iso = computed(() => isoDate(props.article?.published_at ?? null) ?? undefined);

// Instagram signs image URLs and stops serving them after a few days.
const imageFailed = ref(false);
watch(
  () => props.article?.id,
  () => {
    imageFailed.value = false;
  },
);
</script>

<template>
  <section v-if="article" class="detail" aria-labelledby="detalle-titulo">
    <div class="detail-meta">
      <span class="detail-source">
        <span class="dot" :class="dotClass(article.source_id)" />
        {{ article.source_name }}
      </span>
      <span v-if="category" class="tag" :class="{ 'tag-accent': article.category === 'becas' }">
        {{ category }}
      </span>
    </div>

    <h2 id="detalle-titulo" class="detail-title" :lang="article.language">{{ article.title }}</h2>

    <p v-if="date || article.author" class="detail-byline">
      <time v-if="date" :datetime="iso">{{ date }}</time>
      <span v-if="date && article.author"> · </span>
      <span v-if="article.author">{{ article.author }}</span>
    </p>

    <div class="detail-actions">
      <a
        :href="article.link"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-primary"
        aria-keyshortcuts="Enter"
      >
        <Icon name="solar:square-top-down-linear" size="16" />
        Abrir original
        <span class="sr-only">(se abre en una pestaña nueva)</span>
      </a>
      <button
        type="button"
        class="btn save-toggle"
        :aria-pressed="saved"
        aria-keyshortcuts="s"
        @click="toggle(article)"
      >
        <Icon :name="saved ? 'solar:bookmark-bold' : 'solar:bookmark-linear'" size="16" />
        {{ saved ? "Guardado" : "Guardar" }}
        <kbd class="kbd" aria-hidden="true">s</kbd>
      </button>
    </div>

    <img
      v-if="article.image && !imageFailed"
      :src="article.image"
      alt=""
      class="detail-image"
      referrerpolicy="no-referrer"
      @error="imageFailed = true"
    />

    <p v-if="article.description" class="detail-description" :lang="article.language">
      {{ article.description }}
    </p>
    <p v-else class="detail-empty">Esta fuente no incluye un resumen.</p>
  </section>

  <div v-else class="state detail-none">
    <p class="state-title">Ningún artículo seleccionado</p>
    <p class="state-text">
      Elige uno de la lista o muévete con <kbd class="kbd">j</kbd> y <kbd class="kbd">k</kbd>.
    </p>
  </div>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6) var(--space-7);
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}

.detail-source {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-2);
  font-size: var(--text-sm);
  font-weight: 500;
}

.detail-title {
  font-size: var(--text-lg);
  font-weight: 500;
  line-height: var(--leading-tight);
  text-wrap: balance;
}

.detail-byline {
  color: var(--text-3);
  font-size: var(--text-xs);
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.save-toggle[aria-pressed="true"] {
  border-color: var(--accent);
  color: var(--accent);
}

.detail-image {
  max-width: var(--measure);
  max-height: 24rem;
  width: auto;
  height: auto;
  border-radius: var(--radius-md);
  object-fit: contain;
  align-self: flex-start;
}

.detail-description {
  max-width: var(--measure);
  white-space: pre-line;
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
  color: var(--text-2);
  line-height: var(--leading-body);
}

.detail-empty {
  color: var(--text-3);
  font-size: var(--text-sm);
}

.detail-none {
  height: 100%;
}
</style>
