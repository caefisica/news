const DOT_COLOURS = 6;

// Each source keeps one of the dot colours, chosen by its id.
export function dotClass(sourceId: number): string {
  const index = (((sourceId - 1) % DOT_COLOURS) + DOT_COLOURS) % DOT_COLOURS;
  return `dot-${index + 1}`;
}
