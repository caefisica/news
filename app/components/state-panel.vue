<script setup lang="ts">
defineProps<{
  title: string;
  text?: string;
  icon?: string;
  tone?: "danger";
}>();
</script>

<template>
  <div class="state" :class="{ 'state-danger': tone === 'danger' }">
    <Icon v-if="icon" :name="icon" size="32" class="state-icon" />
    <h2 class="state-title">{{ title }}</h2>
    <p v-if="text" class="state-text">{{ text }}</p>
    <div v-if="$slots.default" class="state-actions">
      <slot />
    </div>
  </div>
</template>
