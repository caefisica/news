function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true;
  if (!(target instanceof HTMLInputElement)) return false;
  return !["button", "checkbox", "radio", "submit", "reset"].includes(target.type);
}

// Single-key shortcuts stay out of the way of typing, browser chords and open dialogs.
export function ignoreShortcut(event: KeyboardEvent): boolean {
  return (
    event.defaultPrevented ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    isTyping(event.target) ||
    document.querySelector("dialog[open], [data-drawer-open]") !== null
  );
}
