<script setup lang="ts">
useSeoMeta({
  title: "Acerca",
  description: "Agregador de noticias de física y ciencia para la comunidad científica peruana.",
});
</script>

<template>
  <div class="container page">
    <header class="page-header">
      <h1 class="page-title">RSS para Físicos</h1>
      <p class="page-lead">
        Becas, convocatorias y lecturas de física y ciencia para la comunidad científica peruana.
      </p>
    </header>

    <div class="card-grid">
      <section class="surface about-card">
        <h2 class="about-title">Cómo funciona</h2>
        <p>
          Un sistema automático revisa las fuentes cada 15 minutos, lee los artículos y los guarda
          en una base de datos. La página principal los muestra directamente, sin que tu navegador
          tenga que contactar cada fuente por separado.
        </p>
      </section>

      <section class="surface about-card">
        <h2 class="about-title">Las fuentes</h2>
        <p>
          Elegimos las fuentes una por una. Si quieres sugerir una nueva, abre un issue en GitHub.
          Evaluamos cada sugerencia y, si hace falta, añadimos un lector específico antes de
          activarla.
        </p>
      </section>

      <section class="surface about-card">
        <h2 class="about-title">Privacidad</h2>
        <p>
          No recopilamos datos de usuario. Los artículos que guardas se quedan solo en tu navegador
          (localStorage).
        </p>
      </section>
    </div>

    <footer class="about-footer">
      <a
        href="https://github.com/caefisica/news"
        target="_blank"
        rel="noopener noreferrer"
        class="btn"
        >GitHub<span class="sr-only"> (se abre en una pestaña nueva)</span></a
      >
      <a
        href="https://github.com/caefisica/news/issues/new?template=suggest-source.md"
        target="_blank"
        rel="noopener noreferrer"
        class="btn"
        >Sugerir fuente<span class="sr-only"> (se abre en una pestaña nueva)</span></a
      >
    </footer>
  </div>
</template>

<style scoped>
.about-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
}

.about-title {
  font-size: var(--text-md);
  font-weight: 500;
  line-height: var(--leading-tight);
}

.about-card p {
  color: var(--text-2);
}

.about-footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-7);
  padding-top: var(--space-6);
  border-top: 1px solid var(--border);
}
</style>
