<script setup lang="ts">
useSeoMeta({
  title: "Acerca",
  description: "Agregador de noticias de física y ciencia para la comunidad científica peruana.",
});
</script>

<template>
  <div class="container about-page">
    <section class="hero mask-text">
      <div>
        <h1 class="hero-title">RSS para Físicos</h1>
      </div>
      <div>
        <p class="hero-sub">
          Noticias curadas de física, ciencia y oportunidades académicas para la comunidad
          científica peruana.
        </p>
      </div>
    </section>

    <section class="about-grid">
      <div class="card-shell">
        <div class="card about-card">
          <h2 class="about-card-title label">Cómo funciona</h2>
          <p>
            Un sistema automatizado verifica las fuentes cada 15 minutos, parsea los artículos y los
            almacena en base de datos. La página principal los muestra directamente, sin que tu
            navegador tenga que contactar cada fuente por separado.
          </p>
        </div>
      </div>

      <div class="card-shell">
        <div class="card about-card">
          <h2 class="about-card-title label">Las fuentes</h2>
          <p>
            Las fuentes son curadas manualmente. Si deseas sugerir una fuente nueva, abre un issue
            en GitHub. Evaluamos cada sugerencia y, si es necesario, añadimos un parser específico
            antes de habilitarla.
          </p>
        </div>
      </div>

      <div class="card-shell">
        <div class="card about-card">
          <h2 class="about-card-title label">Privacidad</h2>
          <p>
            No se recopilan datos de usuario. Las preferencias de fuentes visibles se guardan
            únicamente en tu navegador (localStorage).
          </p>
        </div>
      </div>
    </section>

    <footer class="about-footer">
      <a
        href="https://github.com/caefisica/news"
        target="_blank"
        rel="noopener noreferrer"
        class="footer-link label"
        >GitHub</a
      >
      <a
        href="https://github.com/caefisica/news/issues/new?template=suggest-source.md"
        target="_blank"
        rel="noopener noreferrer"
        class="footer-link label"
        >Sugerir fuente</a
      >
    </footer>
  </div>
</template>

<style scoped>
.about-page {
  padding-block: var(--spacing-4xl) var(--spacing-3xl);
}

.hero {
  margin-bottom: var(--spacing-4xl);
}

.hero-title {
  font-size: clamp(32px, 5vw, 60px);
  font-weight: 300;
  letter-spacing: -0.05em;
  line-height: 1;
  margin-bottom: var(--spacing-xl);
}

.hero-sub {
  font-size: 16px;
  font-weight: 300;
  color: var(--color-text-muted);
  max-width: 520px;
  line-height: 26px;
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-4xl);
}

.about-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  height: 100%;
}

.about-card-title {
  color: var(--color-text-secondary);
}

.about-card p {
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 20px;
}

.about-footer {
  display: flex;
  gap: var(--spacing-2xl);
  padding-top: var(--spacing-2xl);
  border-top: 1px solid var(--color-border);
}

.footer-link {
  color: var(--color-text-muted);
  transition:
    color var(--duration-fast) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .footer-link:hover {
    color: var(--color-text);
  }
}

.footer-link:active {
  opacity: 0.5;
}
</style>
