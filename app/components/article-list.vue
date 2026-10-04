<script setup lang="ts">
import type { Article } from "~/types/news";
import { groupByDay } from "~/utils/dates";

const props = defineProps<{
  articles: Article[];
  selectedId: number | null;
  wide: boolean;
  now: Date;
}>();
const emit = defineEmits<{ select: [article: Article] }>();

const groups = computed(() => groupByDay(props.articles, props.now));

// One row is in the tab order: the selected one, or the first.
const tabbableId = computed(() =>
  props.articles.some((article) => article.id === props.selectedId)
    ? props.selectedId
    : (props.articles[0]?.id ?? null),
);
</script>

<template>
  <div class="list" data-list>
    <section
      v-for="group in groups"
      :key="group.key"
      class="group"
      :aria-labelledby="`grupo-${group.key}`"
    >
      <h2 :id="`grupo-${group.key}`" class="group-head">{{ group.label }}</h2>
      <ul>
        <ArticleRow
          v-for="article in group.items"
          :key="article.id"
          :article="article"
          :selected="article.id === selectedId"
          :tabbable="article.id === tabbableId"
          :wide="wide"
          :now="now"
          @select="emit('select', article)"
        />
      </ul>
    </section>
  </div>
</template>

<style scoped>
.group-head {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  display: flex;
  align-items: center;
  height: var(--group-h);
  padding-inline: var(--space-5);
  border-bottom: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text-2);
  font-size: var(--text-xs);
  font-weight: 500;
}

.list:focus-within :deep(.row.selected) {
  background: var(--selected-bg-active);
}

@media (max-width: 767px) {
  .group-head {
    padding-inline: var(--space-4);
  }
}
</style>
