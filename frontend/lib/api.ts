const API_URL = process.env.NEXT_PUBLIC_MANGAVAULT_API_URL || "http://localhost:8787";

export async function fetchSources() {
  const res = await fetch(`${API_URL}/sources`);
  if (!res.ok) throw new Error("Failed to load sources");
  return res.json();
}

export async function searchAll(query: string, language?: string) {
  const url = new URL(`${API_URL}/search`);
  url.searchParams.set("q", query);
  if (language) url.searchParams.set("language", language);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function fetchManga(source: string, id: string) {
  const res = await fetch(`${API_URL}/manga/${source}/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Manga failed");
  return res.json();
}

export async function fetchChapters(source: string, id: string) {
  const res = await fetch(`${API_URL}/manga/${source}/${encodeURIComponent(id)}/chapters`);
  if (!res.ok) throw new Error("Chapters failed");
  return res.json();
}

export async function fetchPages(source: string, id: string) {
  const res = await fetch(`${API_URL}/chapter/${source}/${encodeURIComponent(id)}/pages`);
  if (!res.ok) throw new Error("Pages failed");
  return res.json();
}

export function imageProxyUrl(url: string) {
  try {
    const referer = new URL(url).origin;
    const proxy = new URL(`${API_URL}/image`);
    proxy.searchParams.set("url", url);
    proxy.searchParams.set("referer", referer);
    return proxy.toString();
  } catch {
    return url;
  }
}
