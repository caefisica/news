<script setup lang="ts">
defineProps<{
  title: string;
  text?: string;
  tone?: "danger";
}>();
</script>

<template>
  <div class="surface state" :class="{ 'state-danger': tone === 'danger' }">
    <h2 class="state-title">{{ title }}</h2>
    <p v-if="text" class="state-text">{{ text }}</p>
    <slot />
  </div>
</template>
