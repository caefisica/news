<script setup lang="ts">
defineProps<{ rows: number }>();

// Vary the title length so the placeholder reads as a list, not a block.
const widths = ["72%", "54%", "64%", "48%", "68%", "58%"];
</script>

<template>
  <div aria-hidden="true">
    <div class="skeleton-head"><span class="skeleton skeleton-label" /></div>
    <div v-for="n in rows" :key="n" class="skeleton-row">
      <span class="dot skeleton" />
      <span class="skeleton skeleton-title" :style="{ width: widths[(n - 1) % widths.length] }" />
      <span class="skeleton skeleton-tag" />
      <span class="skeleton skeleton-date" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-head {
  display: flex;
  align-items: center;
  height: var(--group-h);
  padding-inline: var(--space-5);
  border-bottom: 1px solid var(--border);
  background: var(--surface-2);
}

.skeleton-label {
  width: var(--space-8);
  height: var(--space-3);
  background: var(--surface-3);
}

.skeleton-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: var(--row-h);
  padding-inline: var(--space-5) var(--space-4);
  border-bottom: 1px solid var(--border);
}

.skeleton-title {
  height: var(--space-4);
  margin-right: auto;
}

.skeleton-tag {
  width: var(--space-8);
  height: var(--space-4);
}

.skeleton-date {
  width: var(--space-7);
  height: var(--space-3);
}

@media (max-width: 767px) {
  .skeleton-row {
    padding-inline: var(--space-4);
  }

  .skeleton-tag {
    display: none;
  }
}
</style>
