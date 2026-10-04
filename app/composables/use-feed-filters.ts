import type { LocationQuery } from "vue-router";

import type { Source } from "~/types/news";

export const CATEGORIES = [
  { id: "becas", label: "Becas", icon: "solar:diploma-linear" },
  { id: "institucional", label: "Institucional", icon: "solar:buildings-2-linear" },
  { id: "divulgacion", label: "Divulgación", icon: "solar:book-2-linear" },
  { id: "ciencia", label: "Ciencia", icon: "solar:atom-linear" },
] as const;

export function categoryLabel(id: string | null): string | null {
  if (!id) return null;
  return CATEGORIES.find((category) => category.id === id)?.label ?? id;
}

function list(value: unknown): string[] {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw.split(",").filter(Boolean) : [];
}

export function queryCategories(query: LocationQuery): string[] {
  return list(query.categoria);
}

export function querySourceIds(query: LocationQuery): number[] {
  return list(query.fuente).map(Number).filter(Boolean);
}

// The sidebar opens one view at a time: everything, one category or one source.
export function viewQuery(view: { category?: string; sourceId?: number }) {
  if (view.category) return { categoria: view.category };
  if (view.sourceId) return { fuente: String(view.sourceId) };
  return {};
}

// Return null when no source filter is active. Return an empty list when active
// filters exclude every source.
function allowedSources(
  sources: Source[],
  categories: string[],
  sourceIds: number[],
): number[] | null {
  if (categories.length === 0 && sourceIds.length === 0) return null;
  return sources
    .filter(
      (source) =>
        (categories.length === 0 ||
          (source.category !== null && categories.includes(source.category))) &&
        (sourceIds.length === 0 || sourceIds.includes(source.id)),
    )
    .map((source) => source.id);
}

// Keep filters in the URL so filtered results can be shared.
export function useFeedFilters(sources: Ref<Source[]>) {
  const route = useRoute();
  const router = useRouter();

  const q = computed(() => {
    const raw = Array.isArray(route.query.q) ? route.query.q[0] : route.query.q;
    return (raw ?? "").trim();
  });
  const categories = computed(() => queryCategories(route.query));
  const sourceIds = computed(() => querySourceIds(route.query));

  const active = computed(
    () => q.value !== "" || categories.value.length > 0 || sourceIds.value.length > 0,
  );

  const allowedSourceIds = computed(() =>
    allowedSources(sources.value, categories.value, sourceIds.value),
  );

  // Names the open view: one source, one category, or everything.
  const title = computed(() => {
    const names = [
      ...categories.value.map((id) => categoryLabel(id) ?? id),
      ...sourceIds.value.map(
        (id) => sources.value.find((source) => source.id === id)?.name ?? `Fuente ${id}`,
      ),
    ];
    return names.length > 0 ? names.join(" · ") : "Todo";
  });

  function setQuery(value: string) {
    return router.replace({ query: { ...route.query, q: value.trim() || undefined } });
  }

  return {
    q,
    categories,
    sourceIds,
    active,
    allowedSourceIds,
    title,
    setQuery,
    clear: () => router.replace({ query: {} }),
  };
}
