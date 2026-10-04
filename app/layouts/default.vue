<script setup lang="ts">
const route = useRoute();
const drawerOpen = ref(false);
const menuButton = ref<HTMLButtonElement | null>(null);
const shortcuts = ref<{ open: () => void } | null>(null);
const narrow = useMediaQuery("(max-width: 767px)");

function closeDrawer(returnFocus = true) {
  if (!drawerOpen.value) return;
  drawerOpen.value = false;
  if (returnFocus) void nextTick(() => menuButton.value?.focus());
}

watch(
  () => route.fullPath,
  () => closeDrawer(false),
);

// The drawer only exists on narrow screens; widening the window closes it.
watch(narrow, (value) => {
  if (!value) closeDrawer(false);
});

function onKeydown(event: KeyboardEvent) {
  if (event.key === "?" && !ignoreShortcut(event)) {
    event.preventDefault();
    shortcuts.value?.open();
  }
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <div class="shell">
    <a href="#contenido" class="skip-link">Saltar al contenido</a>

    <header class="topbar" :inert="drawerOpen || undefined">
      <button
        ref="menuButton"
        type="button"
        class="btn btn-ghost btn-icon"
        aria-label="Abrir el menú"
        aria-controls="barra-lateral"
        :aria-expanded="drawerOpen"
        @click="drawerOpen = true"
      >
        <Icon name="solar:hamburger-menu-linear" size="20" />
      </button>
      <NuxtLink to="/" class="topbar-brand">
        <BrandMark />
      </NuxtLink>
    </header>

    <AppSidebar
      id="barra-lateral"
      :open="drawerOpen"
      @close="closeDrawer()"
      @shortcuts="shortcuts?.open()"
    />

    <main id="contenido" tabindex="-1" :inert="drawerOpen || undefined">
      <slot />
    </main>

    <ShortcutsDialog ref="shortcuts" />
  </div>
</template>

<style scoped>
.shell {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  height: 100dvh;
  overflow: hidden;
}

.topbar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: var(--topbar-h);
  padding-inline: var(--space-1) var(--space-4);
  border-bottom: 1px solid var(--border);
  background: var(--surface-2);
}

.topbar-brand {
  display: inline-flex;
  align-items: center;
  min-height: var(--hit);
}

main {
  min-width: 0;
  min-height: 0;
}

@media (min-width: 768px) {
  .shell {
    grid-template-rows: minmax(0, 1fr);
    grid-template-columns: var(--sidebar-w) minmax(0, 1fr);
  }

  .topbar {
    display: none;
  }
}
</style>
