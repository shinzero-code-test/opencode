"use client";

import { useLibraryStore } from "../store/useLibraryStore";

export function ContinueReading() {
  const items = useLibraryStore((state) => state.items);
  if (items.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-black/10 p-6 text-sm text-[var(--color-muted)] dark:border-white/10">
        Your continue reading shelf will appear here once you start a chapter.
      </section>
    );
  }
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Continue Reading</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="text-xs text-[var(--color-muted)]">{item.lastChapter}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
