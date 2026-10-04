import type { Source } from "~/types/news";

export const CATEGORIES = [
  { id: "becas", label: "Becas" },
  { id: "institucional", label: "Institucional" },
  { id: "divulgacion", label: "Divulgación" },
  { id: "ciencia", label: "Ciencia" },
] as const;

export function categoryLabel(id: string | null): string | null {
  if (!id) return null;
  return CATEGORIES.find((category) => category.id === id)?.label ?? id;
}

function list(value: unknown): string[] {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw.split(",").filter(Boolean) : [];
}

function toggle<T>(current: T[], value: T): T[] {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
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
  const categories = computed(() => list(route.query.categoria));
  const sourceIds = computed(() => list(route.query.fuente).map(Number).filter(Boolean));

  const active = computed(
    () => q.value !== "" || categories.value.length > 0 || sourceIds.value.length > 0,
  );

  const allowedSourceIds = computed(() =>
    allowedSources(sources.value, categories.value, sourceIds.value),
  );

  function update(next: { q?: string; categories?: string[]; sourceIds?: number[] }) {
    const query = {
      q: (next.q ?? q.value) || undefined,
      categoria: (next.categories ?? categories.value).join(",") || undefined,
      fuente: (next.sourceIds ?? sourceIds.value).join(",") || undefined,
    };
    return router.replace({ query });
  }

  return {
    q,
    categories,
    sourceIds,
    active,
    allowedSourceIds,
    setQuery: (value: string) => update({ q: value.trim() }),
    toggleCategory: (id: string) => update({ categories: toggle(categories.value, id) }),
    toggleSource: (id: number) => update({ sourceIds: toggle(sourceIds.value, id) }),
    clear: () => update({ q: "", categories: [], sourceIds: [] }),
  };
}
