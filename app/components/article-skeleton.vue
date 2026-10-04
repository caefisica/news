<template>
  <div class="surface skeleton-card" aria-hidden="true">
    <span class="skeleton skeleton-title" />
    <span class="skeleton skeleton-line" />
    <span class="skeleton skeleton-meta" />
  </div>
</template>

<style scoped>
.skeleton-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
}

.skeleton-title {
  width: 85%;
  height: var(--space-6);
}

.skeleton-line {
  width: 100%;
  height: var(--space-5);
}

.skeleton-meta {
  width: 50%;
  height: var(--space-4);
  margin-top: var(--space-1);
}
</style>
