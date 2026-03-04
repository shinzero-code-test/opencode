"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "../../../components/ui/button";

export default function AdminPage() {
  const { data, refetch } = useQuery({
    queryKey: ["admin-sources"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_MANGAVAULT_API_URL}/admin/sources`, {
        headers: {
          authorization: `Bearer ${localStorage.getItem("admin_token") || ""}`
        }
      });
      return res.json();
    }
  });
  const [form, setForm] = useState({ name: "", baseUrl: "", language: "en", adapterKey: "" });

  async function submit() {
    await fetch(`${process.env.NEXT_PUBLIC_MANGAVAULT_API_URL}/admin/sources`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${localStorage.getItem("admin_token") || ""}`
      },
      body: JSON.stringify({
        name: form.name,
        baseUrl: form.baseUrl,
        language: form.language,
        adapterKey: form.adapterKey,
        enabled: true
      })
    });
    setForm({ name: "", baseUrl: "", language: "en", adapterKey: "" });
    refetch();
  }

  return (
    <main className="min-h-screen px-6 py-10 md:px-12">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <section className="mt-6 rounded-2xl border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-lg font-semibold">Add Source</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            className="rounded-xl border border-black/10 bg-white/90 px-4 py-2 text-sm"
          />
          <input
            value={form.baseUrl}
            onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
            placeholder="Base URL"
            className="rounded-xl border border-black/10 bg-white/90 px-4 py-2 text-sm"
          />
          <select
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
            className="rounded-xl border border-black/10 bg-white/90 px-4 py-2 text-sm"
          >
            <option value="en">English</option>
            <option value="ar">Arabic</option>
          </select>
          <input
            value={form.adapterKey}
            onChange={(e) => setForm({ ...form, adapterKey: e.target.value })}
            placeholder="Adapter Key"
            className="rounded-xl border border-black/10 bg-white/90 px-4 py-2 text-sm"
          />
        </div>
        <Button onClick={submit} className="mt-4">Save</Button>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold">Sources</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {data?.map((source: any) => (
            <div key={source.key} className="rounded-2xl border border-black/10 bg-white/70 p-4 text-sm dark:border-white/10 dark:bg-white/5">
              <p className="font-semibold">{source.name}</p>
              <p className="text-xs text-[var(--color-muted)]">{source.baseUrl}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
