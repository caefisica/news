// False on the server and until mounted, so the first client render matches the server.
export function useMediaQuery(query: string) {
  const matches = ref(false);
  let list: MediaQueryList | undefined;
  const update = () => {
    matches.value = list?.matches ?? false;
  };

  onMounted(() => {
    list = window.matchMedia(query);
    update();
    list.addEventListener("change", update);
  });
  onBeforeUnmount(() => list?.removeEventListener("change", update));

  return matches;
}
