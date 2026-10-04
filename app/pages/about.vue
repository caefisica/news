<script setup lang="ts">
useSeoMeta({
  title: "Acerca",
  description: "Agregador de noticias de física y ciencia para la comunidad científica peruana.",
});
</script>

<template>
  <div class="view">
    <ViewToolbar title="Acerca" />

    <div class="view-body">
      <article class="doc">
        <p class="doc-lead">
          RSS para Físicos reúne becas, convocatorias y lecturas de física y ciencia para la
          comunidad científica peruana.
        </p>

        <h2>Cómo funciona</h2>
        <p>
          Un sistema automático revisa las fuentes cada 15 minutos, lee los artículos y los guarda
          en una base de datos. La página principal los muestra directamente, sin que tu navegador
          tenga que contactar cada fuente por separado.
        </p>

        <h2>Las fuentes</h2>
        <p>
          Elegimos las fuentes una por una. Si quieres sugerir una nueva,
          <a
            href="https://github.com/caefisica/news/issues/new?template=suggest-source.md"
            target="_blank"
            rel="noopener noreferrer"
            class="link"
            >abre un issue en GitHub<span class="sr-only"> (se abre en una pestaña nueva)</span></a
          >. Evaluamos cada sugerencia y, si hace falta, añadimos un lector específico antes de
          activarla.
        </p>

        <h2>Privacidad</h2>
        <p>
          No recopilamos datos de usuario. Los artículos que guardas se quedan solo en tu navegador
          (localStorage).
        </p>

        <h2>Atajos de teclado</h2>
        <p>
          Muévete por la lista con <kbd class="kbd">j</kbd> y <kbd class="kbd">k</kbd>, abre el
          original con <kbd class="kbd">Enter</kbd> y guarda con <kbd class="kbd">s</kbd>. Pulsa
          <kbd class="kbd">?</kbd> para ver todos.
        </p>

        <p class="doc-foot">
          El código está en
          <a
            href="https://github.com/caefisica/news"
            target="_blank"
            rel="noopener noreferrer"
            class="link"
            >GitHub<span class="sr-only"> (se abre en una pestaña nueva)</span></a
          >.
        </p>
      </article>
    </div>
  </div>
</template>

<style scoped>
.doc {
  max-width: var(--measure);
  padding: var(--space-6) var(--space-5) var(--space-8);
  color: var(--text-2);
  line-height: var(--leading-body);
}

.doc-lead {
  color: var(--text-1);
  font-size: var(--text-md);
}

.doc h2 {
  margin-top: var(--space-6);
  margin-bottom: var(--space-2);
  color: var(--text-1);
  font-size: var(--text-base);
  font-weight: 500;
  line-height: var(--leading-tight);
}

.doc-foot {
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
  font-size: var(--text-sm);
}

@media (min-width: 768px) {
  .doc {
    padding-inline: var(--space-7);
  }
}
</style>
