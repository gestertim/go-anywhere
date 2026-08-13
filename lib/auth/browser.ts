export async function clearPrivateBrowserState() {
  if (typeof window === "undefined") return;

  window.localStorage.clear();
  window.sessionStorage.clear();

  if ("caches" in window) {
    const cacheNames = await window.caches.keys();
    await Promise.all(cacheNames.filter((name) => name.startsWith("go-anywhere")).map((name) => window.caches.delete(name)));
  }
}