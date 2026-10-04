<script setup lang="ts">
import type { Article } from "~/types/news";
import { isoDate, shortDate } from "~/utils/dates";
import { dotClass } from "~/utils/sources";

const props = defineProps<{
  article: Article;
  selected: boolean;
  tabbable: boolean;
  // With a detail panel the row selects; without one it is a link to the original.
  wide: boolean;
  now: Date;
}>();
const emit = defineEmits<{ select: [] }>();

const { isSaved, toggle } = useSavedArticles();
const saved = computed(() => isSaved(props.article.id));
const category = computed(() => categoryLabel(props.article.category));
const date = computed(() => shortDate(props.article.published_at, props.now));
const iso = computed(() => isoDate(props.article.published_at) ?? undefined);
const tabindex = computed(() => (props.tabbable ? 0 : -1));

const mainAttrs = computed(() =>
  props.wide
    ? { type: "button", "aria-current": props.selected ? "true" : undefined }
    : { href: props.article.link, target: "_blank", rel: "noopener noreferrer" },
);
</script>

<template>
  <li class="row" :class="{ selected }">
    <component
      :is="wide ? 'button' : 'a'"
      v-bind="mainAttrs"
      class="row-main"
      :tabindex="tabindex"
      :title="article.title"
      :data-row="article.id"
      @focus="emit('select')"
      @click="emit('select')"
    >
      <span class="dot" :class="dotClass(article.source_id)" />
      <span class="row-title" :lang="article.language">
        <span class="sr-only">{{ article.source_name }}: </span>{{ article.title }}
        <span v-if="!wide" class="sr-only">(se abre en una pestaña nueva)</span>
      </span>
      <span class="row-meta">
        <span v-if="category" class="tag" :class="{ 'tag-accent': article.category === 'becas' }">
          {{ category }}
        </span>
        <time v-if="date" class="row-date" :datetime="iso">{{ date }}</time>
        <span v-if="wide && saved" class="row-saved">
          <Icon name="solar:bookmark-bold" size="16" />
          <span class="sr-only">Guardado</span>
        </span>
      </span>
    </component>
    <button
      v-if="!wide"
      type="button"
      class="btn btn-ghost btn-icon btn-sm row-save"
      :tabindex="tabindex"
      :aria-pressed="saved"
      :aria-label="`${saved ? 'Quitar de guardados' : 'Guardar'}: ${article.title}`"
      @focus="emit('select')"
      @click="toggle(article)"
    >
      <Icon :name="saved ? 'solar:bookmark-bold' : 'solar:bookmark-linear'" size="16" />
    </button>
  </li>
</template>

<style scoped>
.row {
  position: relative;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--border);
  scroll-margin-top: var(--group-h);
  transition: background-color var(--duration-fast) var(--ease);
}

.row:hover:not(.selected) {
  background: var(--hover-bg);
}

.row.selected {
  background: var(--selected-bg);
}

.row.selected::before {
  content: "";
  position: absolute;
  inset-block: 0;
  left: 0;
  width: var(--bar-w);
  background: var(--accent);
}

.row-main {
  display: flex;
  flex: 1;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
  min-height: var(--row-h);
  padding-inline: var(--space-5) var(--space-4);
  border: 0;
  background: transparent;
  color: var(--text-1);
  font-size: var(--text-sm);
  text-align: left;
}

.row-main:focus-visible {
  outline-offset: var(--focus-inset);
}

.row-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row.selected .row-title {
  font-weight: 500;
}

.row-meta {
  display: contents;
}

.row-date {
  min-width: 6ch;
  color: var(--text-3);
  font-size: var(--text-xs);
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
}

.row-saved {
  display: inline-flex;
  color: var(--accent);
}

.row-save {
  flex-shrink: 0;
  margin-right: var(--space-2);
  color: var(--text-2);
}

.row-save[aria-pressed="true"] {
  color: var(--accent);
}

@media (max-width: 767px) {
  .row-main {
    display: grid;
    grid-template-columns: var(--dot-size) minmax(0, 1fr);
    align-items: start;
    row-gap: var(--space-1);
    padding-block: var(--space-3);
    padding-inline: var(--space-4) var(--space-1);
    line-height: var(--leading-tight);
  }

  .row-main .dot {
    margin-top: calc((1lh - var(--dot-size)) / 2);
  }

  .row-title {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    white-space: normal;
  }

  .row-meta {
    display: flex;
    grid-column: 2;
    align-items: center;
    gap: var(--space-3);
  }

  .row-date {
    min-width: 0;
    text-align: left;
  }
}
</style>
