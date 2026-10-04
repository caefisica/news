<template>
  <span class="brand">
    <span class="brand-logo" aria-hidden="true">
      <Icon name="solar:atom-linear" size="16" />
    </span>
    <span class="brand-name">RSS <span class="brand-sep">para</span> Físicos</span>
  </span>
</template>

<style scoped>
.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--text-1);
  font-size: var(--text-sm);
  font-weight: 500;
  white-space: nowrap;
}

.brand-logo {
  display: inline-grid;
  place-items: center;
  width: var(--control-sm);
  height: var(--control-sm);
  border-radius: var(--radius-md);
  background: var(--accent);
  color: var(--on-accent);
}

.brand-sep {
  color: var(--text-3);
}
</style>
