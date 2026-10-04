<script setup lang="ts">
const dialog = ref<HTMLDialogElement | null>(null);

const SHORTCUTS = [
  { keys: ["j", "↓"], label: "Artículo siguiente" },
  { keys: ["k", "↑"], label: "Artículo anterior" },
  { keys: ["Enter"], label: "Abrir el original" },
  { keys: ["s"], label: "Guardar o quitar de guardados" },
  { keys: ["/"], label: "Buscar" },
  { keys: ["Esc"], label: "Quitar la selección o la búsqueda" },
  { keys: ["?"], label: "Mostrar estos atajos" },
];

function open() {
  if (!dialog.value?.open) dialog.value?.showModal();
}

// A click on the backdrop lands on the dialog element itself.
function onClick(event: MouseEvent) {
  if (event.target === dialog.value) dialog.value?.close();
}

defineExpose({ open });
</script>

<template>
  <dialog ref="dialog" class="dialog" aria-labelledby="atajos-titulo" @click="onClick">
    <div class="dialog-head">
      <h2 id="atajos-titulo" class="dialog-title">Atajos de teclado</h2>
      <form method="dialog">
        <button type="submit" class="btn btn-ghost btn-icon btn-sm" aria-label="Cerrar">
          <Icon name="solar:close-square-linear" size="16" />
        </button>
      </form>
    </div>
    <dl class="shortcuts">
      <div v-for="shortcut in SHORTCUTS" :key="shortcut.label" class="shortcut">
        <dt class="shortcut-keys">
          <kbd v-for="key in shortcut.keys" :key="key" class="kbd">{{ key }}</kbd>
        </dt>
        <dd>{{ shortcut.label }}</dd>
      </div>
    </dl>
    <p class="dialog-note">Los atajos no actúan mientras escribes en un campo.</p>
  </dialog>
</template>

<style scoped>
.dialog {
  width: min(var(--dialog-w), calc(100vw - var(--space-6)));
  margin: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface-1);
  color: var(--text-1);
  box-shadow: var(--shadow-modal);
}

.dialog::backdrop {
  background: var(--backdrop);
}

.dialog-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: var(--toolbar-h);
  padding-inline: var(--space-5) var(--space-2);
  border-bottom: 1px solid var(--border);
}

.dialog-title {
  font-size: var(--text-sm);
  font-weight: 500;
}

.shortcuts {
  display: flex;
  flex-direction: column;
  padding: var(--space-3) var(--space-5);
}

.shortcut {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  min-height: var(--control);
  font-size: var(--text-sm);
}

.shortcut-keys {
  display: flex;
  flex-shrink: 0;
  gap: var(--space-1);
  width: var(--space-8);
}

.shortcut dd {
  color: var(--text-2);
}

.dialog-note {
  padding: var(--space-3) var(--space-5) var(--space-4);
  border-top: 1px solid var(--border);
  color: var(--text-3);
  font-size: var(--text-xs);
}
</style>
