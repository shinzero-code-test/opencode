export function LatestSection() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Latest Updates</h2>
        <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Updated</span>
      </div>
      <div className="rounded-2xl border border-black/10 bg-white/70 p-6 text-sm text-[var(--color-muted)] dark:border-white/10 dark:bg-white/5">
        Latest updates will appear once the ingestion pipeline runs.
      </div>
    </section>
  );
}
