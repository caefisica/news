<script setup lang="ts">
defineProps<{ title: string }>();
</script>

<template>
  <div class="toolbar">
    <h1 class="toolbar-title">{{ title }}</h1>
    <div v-if="$slots.default" class="toolbar-controls">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: var(--space-4);
  min-height: var(--toolbar-h);
  padding-inline: var(--space-5) var(--space-3);
  border-bottom: 1px solid var(--border);
  background: var(--surface-1);
}

.toolbar-title {
  min-width: 0;
  overflow: hidden;
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: var(--leading-tight);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toolbar-controls {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
  min-width: 0;
}

@media (max-width: 767px) {
  .toolbar {
    padding-inline: var(--space-4) var(--space-2);
  }
}
</style>
