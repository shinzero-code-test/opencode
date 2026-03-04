"use client";

import { useEffect } from "react";
import { imageProxyUrl } from "../lib/api";
import { useReaderStore } from "../store/useReaderStore";

export function Reader({ pages }: { pages: { index: number; imageUrl: string }[] }) {
  const mode = useReaderStore((state) => state.mode);
  const zoom = useReaderStore((state) => state.zoom);
  const setMode = useReaderStore((state) => state.setMode);
  const setZoom = useReaderStore((state) => state.setZoom);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "+") setZoom(Math.min(2, zoom + 0.1));
      if (event.key === "-") setZoom(Math.max(0.5, zoom - 0.1));
      if (event.key === "ArrowDown") window.scrollBy({ top: 200, behavior: "smooth" });
      if (event.key === "ArrowUp") window.scrollBy({ top: -200, behavior: "smooth" });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setZoom, zoom]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {(["vertical", "horizontal", "single", "double"] as const).map((item) => (
          <button
            key={item}
            onClick={() => setMode(item)}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              mode === item ? "bg-[var(--color-accent)] text-white" : "bg-black/5 dark:bg-white/10"
            }`}
          >
            {item}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button className="rounded-full bg-black/5 px-3 py-2 text-xs" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
            -
          </button>
          <span className="text-xs">{Math.round(zoom * 100)}%</span>
          <button className="rounded-full bg-black/5 px-3 py-2 text-xs" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
            +
          </button>
        </div>
      </div>
      <div
        className={`flex ${
          mode === "horizontal" ? "flex-row gap-4 overflow-x-auto" : "flex-col gap-4"
        }`}
        style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
      >
        {pages.map((page, index) => (
          <div key={page.index} className={mode === "single" && index > 0 ? "hidden" : ""}>
            <img src={imageProxyUrl(page.imageUrl)} alt={`Page ${page.index + 1}`} className="max-w-full rounded-2xl shadow" />
          </div>
        ))}
      </div>
    </section>
  );
}
