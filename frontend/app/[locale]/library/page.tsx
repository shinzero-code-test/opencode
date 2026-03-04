"use client";

import { useLibraryStore } from "../../../store/useLibraryStore";
import { Button } from "../../../components/ui/button";

export default function LibraryPage() {
  const items = useLibraryStore((state) => state.items);
  const addItem = useLibraryStore((state) => state.addItem);

  function exportLibrary() {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mangavault-library.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function importLibrary(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = JSON.parse(String(reader.result)) as any[];
      parsed.forEach((item) => addItem(item));
    };
    reader.readAsText(file);
  }

  return (
    <main className="min-h-screen px-6 py-10 md:px-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Library</h1>
        <div className="flex items-center gap-3">
          <Button onClick={exportLibrary} className="px-4 py-2 text-xs">
            Export
          </Button>
          <label className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-semibold dark:border-white/10 dark:bg-white/5">
            Import
            <input type="file" accept="application/json" className="hidden" onChange={importLibrary} />
          </label>
        </div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-black/10 bg-white/70 p-4 text-sm dark:border-white/10 dark:bg-white/5">
            <p className="font-semibold">{item.title}</p>
            <p className="text-xs text-[var(--color-muted)]">{item.source}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
