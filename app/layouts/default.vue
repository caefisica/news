<template>
  <div>
    <a href="#contenido" class="skip-link">Saltar al contenido</a>
    <LayoutAppHeader />
    <main id="contenido" tabindex="-1">
      <slot />
    </main>
  </div>
</template>
