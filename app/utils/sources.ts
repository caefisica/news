const DOT_COLOURS = 6;

export function dotClass(sourceId: number): string {
  const index = (((sourceId - 1) % DOT_COLOURS) + DOT_COLOURS) % DOT_COLOURS;
  return `dot-${index + 1}`;
}
