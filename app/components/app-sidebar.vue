<script setup lang="ts">
import { dotClass } from "~/utils/sources";

defineOptions({ inheritAttrs: false });

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: []; shortcuts: [] }>();

const route = useRoute();
const colorMode = useColorMode();
const { saved, ready } = useSavedArticles();
const { sources, error } = await useSources();

const panel = ref<HTMLElement | null>(null);

const THEMES = [
  { id: "light", label: "Claro" },
  { id: "dark", label: "Oscuro" },
  { id: "system", label: "Sistema" },
] as const;

const total = computed(() => sources.value.reduce((sum, source) => sum + source.article_count, 0));

function categoryCount(id: string): number {
  return sources.value
    .filter((source) => source.category === id)
    .reduce((sum, source) => sum + source.article_count, 0);
}

// The feed shows one view at a time, so exactly one sidebar item is current.
const view = computed(() => {
  if (route.path !== "/") return route.path;
  const categories = queryCategories(route.query);
  const sourceIds = querySourceIds(route.query);
  if (categories.length === 1 && sourceIds.length === 0) return `categoria:${categories[0]}`;
  if (sourceIds.length === 1 && categories.length === 0) return `fuente:${sourceIds[0]}`;
  if (categories.length === 0 && sourceIds.length === 0) return "/";
  return null;
});

const current = (key: string) => (view.value === key ? "page" : undefined);

const focusable = () =>
  [...(panel.value?.querySelectorAll<HTMLElement>("a[href], button, input:checked") ?? [])].filter(
    (el) => !el.hasAttribute("disabled"),
  );

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    await nextTick();
    focusable()[0]?.focus();
  },
);

// While the drawer is open, Tab wraps inside it and Escape closes it.
function onKeydown(event: KeyboardEvent) {
  if (!props.open) return;
  if (event.key === "Escape") {
    event.preventDefault();
    emit("close");
    return;
  }
  if (event.key !== "Tab") return;
  const items = focusable();
  const first = items[0];
  const last = items.at(-1);
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
</script>

<template>
  <div class="sidebar-frame" :class="{ open }">
    <div v-if="open" class="backdrop" aria-hidden="true" @click="emit('close')" />

    <aside
      v-bind="$attrs"
      ref="panel"
      class="sidebar"
      aria-label="Barra lateral"
      :role="open ? 'dialog' : undefined"
      :aria-modal="open || undefined"
      :data-drawer-open="open || undefined"
      @keydown="onKeydown"
    >
      <div class="sidebar-head">
        <NuxtLink to="/" class="sidebar-brand">
          <BrandMark />
        </NuxtLink>
        <button
          type="button"
          class="btn btn-ghost btn-icon drawer-close"
          aria-label="Cerrar el menú"
          @click="emit('close')"
        >
          <Icon name="solar:close-square-linear" size="20" />
        </button>
      </div>

      <nav class="sidebar-body" aria-label="Principal">
        <ul class="nav-list">
          <li>
            <NuxtLink to="/" class="nav-item" :aria-current="current('/')">
              <Icon name="solar:inbox-line-linear" size="16" class="nav-icon" />
              <span class="nav-label">Todo</span>
              <span v-if="total > 0" class="nav-count">{{ total }}</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/guardados" class="nav-item" :aria-current="current('/guardados')">
              <Icon name="solar:bookmark-linear" size="16" class="nav-icon" />
              <span class="nav-label">Guardados</span>
              <span v-if="ready && saved.length > 0" class="nav-count">{{ saved.length }}</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/sources" class="nav-item" :aria-current="current('/sources')">
              <Icon name="solar:list-linear" size="16" class="nav-icon" />
              <span class="nav-label">Fuentes</span>
              <span v-if="sources.length > 0" class="nav-count">{{ sources.length }}</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/about" class="nav-item" :aria-current="current('/about')">
              <Icon name="solar:info-circle-linear" size="16" class="nav-icon" />
              <span class="nav-label">Acerca</span>
            </NuxtLink>
          </li>
        </ul>

        <h2 id="nav-categorias" class="nav-heading">Categorías</h2>
        <ul class="nav-list" aria-labelledby="nav-categorias">
          <li v-for="category in CATEGORIES" :key="category.id">
            <NuxtLink
              :to="{ path: '/', query: viewQuery({ category: category.id }) }"
              class="nav-item"
              :aria-current="current(`categoria:${category.id}`)"
            >
              <Icon :name="category.icon" size="16" class="nav-icon" />
              <span class="nav-label">{{ category.label }}</span>
              <span v-if="categoryCount(category.id) > 0" class="nav-count">
                {{ categoryCount(category.id) }}
              </span>
            </NuxtLink>
          </li>
        </ul>

        <h2 id="nav-fuentes" class="nav-heading">Fuentes</h2>
        <p v-if="error" class="nav-note">No se pudieron cargar las fuentes.</p>
        <ul v-else class="nav-list" aria-labelledby="nav-fuentes">
          <li v-for="source in sources" :key="source.id">
            <NuxtLink
              :to="{ path: '/', query: viewQuery({ sourceId: source.id }) }"
              class="nav-item"
              :aria-current="current(`fuente:${source.id}`)"
            >
              <span class="nav-icon nav-dot">
                <span class="dot" :class="dotClass(source.id)" />
              </span>
              <span class="nav-label">{{ source.name }}</span>
              <span class="nav-count">{{ source.article_count }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="sidebar-foot">
        <ClientOnly>
          <div class="segment" role="radiogroup" aria-label="Tema">
            <label v-for="theme in THEMES" :key="theme.id" class="segment-item">
              <input
                v-model="colorMode.preference"
                type="radio"
                name="tema"
                :value="theme.id"
                class="sr-only"
              />
              {{ theme.label }}
            </label>
          </div>
          <template #fallback>
            <div class="segment" aria-hidden="true" />
          </template>
        </ClientOnly>
        <button type="button" class="nav-item shortcuts-button" @click="emit('shortcuts')">
          <Icon name="solar:keyboard-linear" size="16" class="nav-icon" />
          <span class="nav-label">Atajos de teclado</span>
          <kbd class="kbd">?</kbd>
        </button>
      </div>
    </aside>
  </div>
</template>

<style scoped>
/* The aside is the grid item in the shell; the frame only groups it with the backdrop. */
.sidebar-frame {
  display: contents;
}

.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  border-right: 1px solid var(--border);
  background: var(--surface-2);
}

.sidebar-head {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  min-height: var(--toolbar-h);
  padding-inline: var(--space-3) var(--space-1);
  border-bottom: 1px solid var(--border);
}

.sidebar-brand {
  display: inline-flex;
  align-items: center;
  min-height: var(--hit);
  padding-inline: var(--space-1);
  border-radius: var(--radius-md);
}

.sidebar-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: var(--space-3) var(--space-3) var(--space-5);
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-0);
}

.nav-heading {
  margin: var(--space-5) var(--space-3) var(--space-2);
  color: var(--text-3);
  font-size: var(--text-xs);
  font-weight: 500;
}

.nav-note {
  padding-inline: var(--space-3);
  color: var(--text-2);
  font-size: var(--text-xs);
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  min-height: var(--hit-sm);
  padding-inline: var(--space-3);
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-2);
  font-size: var(--text-sm);
  text-align: left;
  transition:
    background-color var(--duration-fast) var(--ease),
    color var(--duration-fast) var(--ease);
}

.nav-item:hover {
  background: var(--hover-bg-2);
  color: var(--text-1);
}

.nav-item:focus-visible {
  outline-offset: var(--focus-inset);
}

.nav-item[aria-current="page"] {
  background: var(--selected-bg);
  color: var(--text-1);
  font-weight: 500;
}

.nav-item[aria-current="page"]::before {
  content: "";
  position: absolute;
  inset-block: var(--space-2);
  left: 0;
  width: var(--bar-w);
  border-radius: var(--radius-sm);
  background: var(--accent);
}

.nav-icon {
  display: inline-grid;
  flex-shrink: 0;
  place-items: center;
  width: var(--icon);
  height: var(--icon);
  color: var(--text-3);
}

.nav-item[aria-current="page"] .nav-icon {
  color: var(--accent);
}

.nav-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-count {
  color: var(--text-3);
  font-size: var(--text-xs);
  font-variant-numeric: tabular-nums;
}

.sidebar-foot {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  border-top: 1px solid var(--border);
}

.segment {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  min-height: var(--hit-sm);
  padding: var(--space-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-3);
}

.segment-item {
  display: grid;
  place-items: center;
  border-radius: var(--radius-sm);
  color: var(--text-2);
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: pointer;
}

.segment-item:hover {
  color: var(--text-1);
}

.segment-item:has(:checked) {
  background: var(--surface-1);
  box-shadow: inset 0 0 0 1px var(--border);
  color: var(--text-1);
}

.segment-item:has(:focus-visible) {
  outline: var(--focus-ring);
  outline-offset: var(--focus-inset);
}

.drawer-close {
  display: none;
}

.backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--z-drawer);
  background: var(--backdrop);
}

@media (max-width: 767px) {
  .sidebar {
    position: fixed;
    inset-block: 0;
    left: 0;
    z-index: var(--z-drawer);
    width: min(var(--drawer-w), calc(100vw - var(--space-8)));
    box-shadow: var(--shadow-modal);
    visibility: hidden;
    transform: translateX(-100%);
    transition:
      transform var(--duration-base) var(--ease),
      visibility 0s linear var(--duration-base);
  }

  .open .sidebar {
    visibility: visible;
    transform: none;
    transition: transform var(--duration-base) var(--ease);
  }

  .drawer-close {
    display: inline-flex;
  }
}
</style>
