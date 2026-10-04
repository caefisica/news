<script setup lang="ts">
const colorMode = useColorMode();
const { saved, ready } = useSavedArticles();

const links = [
  { to: "/", label: "Inicio" },
  { to: "/guardados", label: "Guardados" },
  { to: "/sources", label: "Fuentes" },
  { to: "/about", label: "Acerca" },
];

function toggleTheme() {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}
</script>

<template>
  <header class="header">
    <div class="container header-inner">
      <NuxtLink to="/" class="brand"> RSS <span class="brand-sep">para</span> Físicos </NuxtLink>
      <nav class="nav" aria-label="Principal">
        <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="nav-link">
          {{ link.label }}
          <span v-if="link.to === '/guardados' && ready && saved.length > 0" class="nav-count">
            {{ saved.length }}
          </span>
        </NuxtLink>
      </nav>
      <button
        class="btn btn-ghost btn-icon theme-toggle"
        type="button"
        :aria-label="`Cambiar a modo ${colorMode.value === 'dark' ? 'claro' : 'oscuro'}`"
        @click="toggleTheme"
      >
        <Icon v-if="colorMode.value === 'dark'" name="solar:sun-linear" size="16" />
        <Icon v-else name="solar:moon-linear" size="16" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  border-bottom: 1px solid var(--border);
  background: var(--surface-1);
}

.header-inner {
  display: grid;
  grid-template-areas:
    "brand toggle"
    "nav nav";
  grid-template-columns: 1fr auto;
  align-items: center;
  column-gap: var(--space-4);
  padding-block: var(--space-2);
}

.brand {
  grid-area: brand;
  display: inline-flex;
  align-items: center;
  min-height: var(--hit);
  font-weight: 500;
  letter-spacing: -0.01em;
}

.brand-sep {
  margin-inline: var(--space-1);
  color: var(--text-3);
}

.nav {
  grid-area: nav;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-inline: calc(var(--space-3) * -1);
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--hit);
  padding-inline: var(--space-3);
  border-radius: var(--radius-md);
  color: var(--text-2);
  font-size: var(--text-sm);
  font-weight: 500;
  transition:
    background-color var(--duration-fast) var(--ease),
    color var(--duration-fast) var(--ease);
}

.nav-link:hover {
  background: var(--surface-2);
  color: var(--text-1);
}

.nav-link[aria-current="page"] {
  background: var(--surface-3);
  color: var(--text-1);
}

.nav-count {
  padding: 0 var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--accent-soft);
  color: var(--accent);
  font-size: var(--text-xs);
}

.theme-toggle {
  grid-area: toggle;
  color: var(--text-2);
}

@media (min-width: 768px) {
  .header {
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .header-inner {
    grid-template-areas: "brand nav toggle";
    grid-template-columns: auto 1fr auto;
    column-gap: var(--space-6);
    min-height: var(--header-h);
  }

  .nav {
    margin-inline: 0;
  }
}
</style>
