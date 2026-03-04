import { fetchChapters, fetchManga } from "../../../../../lib/api";
import Link from "next/link";
import { DownloadPanel } from "../../../../../components/DownloadPanel";


export default async function MangaPage({
  params
}: {
  params: Promise<{ source: string; id: string; locale: string }>;
}) {
  const { source, id, locale } = await params;
  const manga = await fetchManga(source, id);
  const chapters = await fetchChapters(source, id);
  const searchUrl = new URL(`${process.env.NEXT_PUBLIC_MANGAVAULT_API_URL}/search`);
  searchUrl.searchParams.set("q", manga.title);
  const searchRes = await fetch(searchUrl.toString());
  const searchJson = searchRes.ok ? await searchRes.json() : [];
  const sources = Array.isArray(searchJson)
    ? searchJson
    : Array.isArray(searchJson.results)
      ? searchJson.results
      : [];
  return (
    <main className="min-h-screen px-6 py-10 md:px-12">
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <div className="rounded-2xl bg-black/10">
          {manga.coverUrl ? <img src={manga.coverUrl} alt={manga.title} className="h-full w-full rounded-2xl object-cover" /> : null}
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold">{manga.title}</h1>
          <p className="text-sm text-[var(--color-muted)]">{manga.description}</p>
          <div className="flex flex-wrap gap-2">
            {manga.genres?.map((genre: string) => (
              <span key={genre} className="rounded-full bg-black/5 px-3 py-1 text-xs dark:bg-white/10">
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
      <section className="mt-6">
        <h2 className="text-sm font-semibold">Switch Source</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {sources.flatMap((group: any) =>
            group.items.slice(0, 1).map((item: any) => (
              <Link
                key={`${group.source}-${item.id}`}
                href={`/${locale}/manga/${group.source}/${encodeURIComponent(item.id)}`}
                className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs dark:border-white/10 dark:bg-white/5"
              >
                {group.source}
              </Link>
            ))
          )}
        </div>
      </section>

      <DownloadPanel source={source} mangaTitle={manga.title} chapters={chapters} />
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Chapters</h2>
        <div className="mt-4 grid gap-2">
          {chapters.map((chapter: any) => (
            <Link
              key={chapter.id}
              href={`/${locale}/reader/${source}/${encodeURIComponent(chapter.id)}`}
              className="rounded-xl border border-black/10 bg-white/70 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5"
            >
              {chapter.title || `Chapter ${chapter.number ?? ""}`}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
