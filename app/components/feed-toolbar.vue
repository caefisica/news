<script setup lang="ts">
import type { Source } from "~/types/news";

const props = defineProps<{ sources: Source[] }>();

const { q, categories, sourceIds, active, setQuery, toggleCategory, toggleSource, clear } =
  useFeedFilters(toRef(props, "sources"));

const text = ref(q.value);
const input = ref<HTMLInputElement | null>(null);
const sourcesOpen = ref(sourceIds.value.length > 0);
let timer: ReturnType<typeof setTimeout> | undefined;

// The URL is the source of truth; follow it unless the user is mid-typing.
watch(q, (value) => {
  if (timer === undefined) text.value = value;
});

watch(
  () => sourceIds.value.length,
  (count) => {
    if (count > 0) sourcesOpen.value = true;
  },
);

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

onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
  <div class="toolbar">
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
        @input="onInput"
      />
      <button
        v-if="text"
        type="button"
        class="btn btn-ghost btn-icon search-clear"
        aria-label="Borrar búsqueda"
        @click="clearText"
      >
        <Icon name="solar:close-circle-linear" size="16" />
      </button>
    </form>

    <div class="filters">
      <div class="chips" role="group" aria-label="Categoría">
        <button
          v-for="category in CATEGORIES"
          :key="category.id"
          type="button"
          class="chip"
          :aria-pressed="categories.includes(category.id)"
          @click="toggleCategory(category.id)"
        >
          {{ category.label }}
        </button>
      </div>

      <button
        type="button"
        class="chip sources-toggle"
        aria-controls="fuentes"
        :aria-expanded="sourcesOpen"
        @click="sourcesOpen = !sourcesOpen"
      >
        Fuentes
        <span v-if="sourceIds.length > 0" class="tag tag-accent">{{ sourceIds.length }}</span>
        <Icon
          :name="sourcesOpen ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'"
          size="16"
        />
      </button>

      <button v-if="active" type="button" class="btn btn-ghost" @click="clear">
        Limpiar filtros
      </button>
    </div>

    <div v-show="sourcesOpen" id="fuentes" class="chips" role="group" aria-label="Fuente">
      <button
        v-for="source in sources"
        :key="source.id"
        type="button"
        class="chip"
        :aria-pressed="sourceIds.includes(source.id)"
        @click="toggleSource(source.id)"
      >
        {{ source.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.search {
  position: relative;
  max-width: 480px;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: var(--space-4);
  translate: 0 -50%;
  color: var(--text-3);
  pointer-events: none;
}

.search-input {
  padding-inline: calc(var(--space-4) + var(--space-5) + var(--space-3)) var(--hit);
}

.search-clear {
  position: absolute;
  top: 0;
  right: 0;
  color: var(--text-2);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}
</style>
