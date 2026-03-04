"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchAll } from "../lib/api";
import { MangaCard } from "./MangaCard";
import { Button } from "./ui/button";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["search", submitted],
    queryFn: () => searchAll(submitted),
    enabled: submitted.length > 1
  });

  return (
    <div className="space-y-6">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(query.trim());
        }}
        className="flex flex-col gap-3 md:flex-row"
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search across all sources"
          className="flex-1 rounded-full border border-black/10 bg-white/80 px-5 py-3 text-sm shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5"
        />
        <Button type="submit">Search</Button>
      </form>

      {isLoading && <p className="text-sm text-[var(--color-muted)]">Searching...</p>}
      {(!Array.isArray(data) && data?.errors?.length) ? (
        <p className="text-xs text-[var(--color-muted)]">Some sources failed. Showing available results.</p>
      ) : null}
      {(Array.isArray(data) || data?.results) && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(Array.isArray(data) ? data : data.results).flatMap((group: any) =>
            group.items.map((item: any) => <MangaCard key={`${group.source}-${item.id}`} manga={item} />)
          )}
        </div>
      )}
    </div>
  );
}
