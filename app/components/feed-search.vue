<script setup lang="ts">
import type { Source } from "~/types/news";
import { ignoreShortcut } from "~/utils/keys";

const props = defineProps<{ sources: Source[] }>();

const { q, setQuery } = useFeedFilters(toRef(props, "sources"));

const text = ref(q.value);
const input = ref<HTMLInputElement | null>(null);
let timer: ReturnType<typeof setTimeout> | undefined;

// The URL is authoritative. Do not replace text while the user is typing.
watch(q, (value) => {
  if (timer === undefined) text.value = value;
});

function onInput() {
  clearTimeout(timer);
  timer = setTimeout(submit, 300);
}

function submit() {
  clearTimeout(timer);
  timer = undefined;
  void setQuery(text.value);
}

function clearText() {
  text.value = "";
  submit();
  input.value?.focus();
}

// Escape empties the field first, then hands focus back to the list.
function onEscape() {
  if (text.value) clearText();
  else input.value?.blur();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== "/" || ignoreShortcut(event)) return;
  event.preventDefault();
  input.value?.focus();
  input.value?.select();
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  clearTimeout(timer);
});
</script>

<template>
  <form class="search" role="search" @submit.prevent="submit">
    <label for="buscar" class="sr-only">Buscar artículos</label>
    <Icon name="solar:magnifer-linear" size="16" class="search-icon" aria-hidden="true" />
    <input
      id="buscar"
      ref="input"
      v-model="text"
      type="search"
      name="q"
      class="input search-input"
      placeholder="Buscar becas y temas"
      autocomplete="off"
      enterkeyhint="search"
      aria-keyshortcuts="/"
      @input="onInput"
      @keydown.esc.prevent="onEscape"
    />
    <button
      v-if="text"
      type="button"
      class="btn btn-ghost btn-icon btn-sm search-clear"
      aria-label="Borrar búsqueda"
      @click="clearText"
    >
      <Icon name="solar:close-circle-linear" size="16" />
    </button>
    <kbd v-else class="kbd search-hint" aria-hidden="true">/</kbd>
  </form>
</template>

<style scoped>
.search {
  position: relative;
  flex: 0 1 var(--search-w);
  min-width: 0;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: var(--space-3);
  translate: 0 -50%;
  color: var(--text-3);
  pointer-events: none;
}

.search-input {
  padding-inline: calc(var(--space-3) + var(--icon) + var(--space-2)) var(--hit-sm);
}

.search-input:focus-visible {
  border-color: var(--accent);
  outline-offset: var(--focus-inset);
}

.search-clear {
  position: absolute;
  top: 0;
  right: 0;
  color: var(--text-2);
}

.search-hint {
  position: absolute;
  top: 50%;
  right: var(--space-2);
  translate: 0 -50%;
  pointer-events: none;
}

.search:focus-within .search-hint {
  display: none;
}

@media (max-width: 767px), (pointer: coarse) {
  .search {
    flex-grow: 1;
  }

  .search-hint {
    display: none;
  }
}
</style>
