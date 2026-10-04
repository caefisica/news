<script setup lang="ts">
import type { Article } from "~/types/news";
import { ignoreShortcut } from "~/utils/keys";

const WIDTH_KEY = "nr:detail-width";
const MIN_WIDTH = 320;
const MAX_WIDTH = 720;
const DEFAULT_WIDTH = 420;
const KEY_STEP = 16;

const props = defineProps<{ articles: Article[]; stale?: boolean }>();
// Escape with nothing selected passes on, so the page can clear its search.
const emit = defineEmits<{ escape: [] }>();

const route = useRoute();
const { toggle } = useSavedArticles();
const wide = useMediaQuery("(min-width: 1100px)");
const now = new Date();

// Holding the article, not its id, keeps the detail open after it leaves the list.
const selected = ref<Article | null>(null);
const selectedId = computed(() => selected.value?.id ?? null);

watch(
  () => route.fullPath,
  () => {
    selected.value = null;
  },
);

function rowElement(id: number) {
  return document.querySelector<HTMLElement>(`[data-row="${id}"]`);
}

async function move(delta: number) {
  const list = props.articles;
  if (list.length === 0) return;
  const index = list.findIndex((article) => article.id === selectedId.value);
  const next = index === -1 ? 0 : Math.min(Math.max(index + delta, 0), list.length - 1);
  const article = list[next];
  if (!article) return;
  selected.value = article;
  await nextTick();
  rowElement(article.id)?.focus();
}

function openOriginal(article: Article) {
  window.open(article.link, "_blank", "noopener,noreferrer");
}

// Keys act on the list only when focus is on a row or on nothing in particular.
function focusIsFree(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return true;
  if (target.closest("[data-row]")) return true;
  return target === document.body || target.id === "contenido";
}

function onKeydown(event: KeyboardEvent) {
  if (ignoreShortcut(event)) return;
  const article = selected.value;
  switch (event.key) {
    case "j":
      event.preventDefault();
      void move(1);
      break;
    case "k":
      event.preventDefault();
      void move(-1);
      break;
    case "ArrowDown":
    case "ArrowUp":
      if (!focusIsFree(event.target)) return;
      event.preventDefault();
      void move(event.key === "ArrowDown" ? 1 : -1);
      break;
    case "Enter":
      if (!article || !focusIsFree(event.target)) return;
      event.preventDefault();
      openOriginal(article);
      break;
    case "s":
      if (!article) return;
      event.preventDefault();
      toggle(article);
      break;
    case "Escape":
      if (article) selected.value = null;
      else emit("escape");
      break;
  }
}

const width = ref(DEFAULT_WIDTH);
const clampWidth = (value: number) => Math.round(Math.min(Math.max(value, MIN_WIDTH), MAX_WIDTH));

function persistWidth() {
  try {
    localStorage.setItem(WIDTH_KEY, String(width.value));
  } catch {
    // Storage blocked: the width lasts for this visit.
  }
}

let dragStart: { x: number; width: number } | null = null;

function onPointerdown(event: PointerEvent) {
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  dragStart = { x: event.clientX, width: width.value };
}

// The panel sits on the right, so dragging its edge to the left widens it.
function onPointermove(event: PointerEvent) {
  if (dragStart) width.value = clampWidth(dragStart.width + dragStart.x - event.clientX);
}

function onPointerup() {
  if (!dragStart) return;
  dragStart = null;
  persistWidth();
}

function onResizerKeydown(event: KeyboardEvent) {
  const step = { ArrowLeft: KEY_STEP, ArrowRight: -KEY_STEP }[event.key];
  if (step === undefined) return;
  event.preventDefault();
  width.value = clampWidth(width.value + step);
  persistWidth();
}

onMounted(() => {
  try {
    const stored = Number(localStorage.getItem(WIDTH_KEY));
    if (Number.isFinite(stored) && stored > 0) width.value = clampWidth(stored);
  } catch {
    // Storage blocked: keep the default width.
  }
  window.addEventListener("keydown", onKeydown);
});
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <div class="browser" :style="{ '--detail-w': `${width}px` }">
    <div class="list-pane" data-scroll>
      <slot name="state">
        <ArticleList
          :class="{ stale }"
          :articles="articles"
          :selected-id="selectedId"
          :wide="wide"
          :now="now"
          @select="selected = $event"
        />
        <slot />
      </slot>
    </div>

    <aside class="detail-pane" aria-label="Detalle del artículo">
      <div
        class="resizer"
        role="separator"
        tabindex="0"
        aria-orientation="vertical"
        aria-label="Ancho del panel de detalle"
        :aria-valuemin="MIN_WIDTH"
        :aria-valuemax="MAX_WIDTH"
        :aria-valuenow="width"
        @pointerdown="onPointerdown"
        @pointermove="onPointermove"
        @pointerup="onPointerup"
        @pointercancel="onPointerup"
        @keydown="onResizerKeydown"
      />
      <div class="detail-scroll">
        <ArticleDetail v-if="!$slots.state" :article="selected" />
      </div>
    </aside>
  </div>
</template>

<style scoped>
.browser {
  display: flex;
  flex: 1;
  min-height: 0;
}

.list-pane {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.stale {
  opacity: var(--opacity-pending);
}

.detail-pane {
  position: relative;
  display: none;
  flex: 0 0 auto;
  width: min(var(--detail-w), 50%);
  border-left: 1px solid var(--border);
  background: var(--surface-1);
}

.detail-scroll {
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* Keep the hit area wider than the visible divider. */
.resizer {
  position: absolute;
  inset-block: 0;
  left: calc(var(--resizer-w) / -2);
  z-index: var(--z-sticky);
  width: var(--resizer-w);
  cursor: col-resize;
  touch-action: none;
}

.resizer:hover,
.resizer:active,
.resizer:focus-visible {
  background: var(--accent);
}

@media (min-width: 1100px) {
  .detail-pane {
    display: block;
  }
}
</style>
