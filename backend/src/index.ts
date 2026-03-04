import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { getScrapers } from "./scrapers/registry";
import type { Env } from "./env";
import type { SearchFilters } from "./types";
import { RateLimiterDO } from "./do/RateLimiterDO";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({ origin: "*" }));

app.get("/health", (c) => c.json({ ok: true, env: c.env.ENVIRONMENT }));

app.get("/sources", async (c) => {
  const scrapers = await getScrapers(c.env);
  return c.json(
    Object.values(scrapers).map((s) => ({ key: s.key, name: s.name, baseUrl: s.baseUrl, language: s.language }))
  );
});

const searchQuerySchema = z.object({
  q: z.string().min(1),
  language: z.enum(["ar", "en"]).optional(),
  status: z.string().optional(),
  ratingMin: z.string().optional(),
  year: z.string().optional()
});

app.get("/search", async (c) => {
  const parsed = searchQuerySchema.safeParse(Object.fromEntries(new URL(c.req.url).searchParams));
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  const { q, language, status, ratingMin, year } = parsed.data;
  const filters: SearchFilters = {
    language,
    status,
    ratingMin: ratingMin ? Number(ratingMin) : undefined,
    year: year ? Number(year) : undefined
  };
  const scrapers = await getScrapers(c.env);
  const results = await Promise.all(
    Object.values(scrapers)
      .filter((s) => (filters.language ? s.language === filters.language : true))
      .map(async (scraper) => ({ source: scraper.key, items: await scraper.search(q, filters) }))
  );
  return c.json(results);
});

app.get("/manga/:source/:id", async (c) => {
  const scrapers = await getScrapers(c.env);
  const source = c.req.param("source");
  const id = decodeURIComponent(c.req.param("id"));
  const scraper = scrapers[source];
  if (!scraper) return c.json({ error: "Unknown source" }, 404);
  const manga = await scraper.getManga(id);
  return c.json(manga);
});

app.get("/manga/:source/:id/chapters", async (c) => {
  const scrapers = await getScrapers(c.env);
  const source = c.req.param("source");
  const id = decodeURIComponent(c.req.param("id"));
  const scraper = scrapers[source];
  if (!scraper) return c.json({ error: "Unknown source" }, 404);
  const chapters = await scraper.getChapters(id);
  return c.json(chapters);
});

app.get("/chapter/:source/:id/pages", async (c) => {
  const scrapers = await getScrapers(c.env);
  const source = c.req.param("source");
  const id = decodeURIComponent(c.req.param("id"));
  const scraper = scrapers[source];
  if (!scraper) return c.json({ error: "Unknown source" }, 404);
  const pages = await scraper.getPages(id);
  return c.json(pages);
});

app.get("/image", async (c) => {
  const url = c.req.query("url");
  const referer = c.req.query("referer") || "";
  if (!url) return c.json({ error: "Missing url" }, 400);
  const res = await fetch(url, { headers: { Referer: referer } });
  if (!res.ok) return c.json({ error: "Fetch failed" }, 502);
  return new Response(res.body, {
    headers: {
      "content-type": res.headers.get("content-type") || "image/jpeg",
      "cache-control": "public, max-age=86400"
    }
  });
});



app.post("/admin/sources", async (c) => {
  const auth = c.req.header("authorization")?.replace("Bearer ", "");
  if (!auth || auth !== c.env.ADMIN_TOKEN) return c.json({ error: "Unauthorized" }, 401);
  const data = await c.req.json();
  await c.env.DB.prepare(
    "INSERT INTO sources (id, name, base_url, language, enabled, adapter_key, config_json) VALUES (?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(
      crypto.randomUUID(),
      data.name,
      data.baseUrl,
      data.language,
      data.enabled ? 1 : 0,
      data.adapterKey,
      JSON.stringify(data.config ?? {})
    )
    .run();
  return c.json({ ok: true });
});

app.get("/admin/sources", async (c) => {
  const auth = c.req.header("authorization")?.replace("Bearer ", "");
  if (!auth || auth !== c.env.ADMIN_TOKEN) return c.json({ error: "Unauthorized" }, 401);
  const result = await c.env.DB.prepare("SELECT * FROM sources").all();
  return c.json(result.results ?? []);
});

app.patch("/admin/sources/:id", async (c) => {
  const auth = c.req.header("authorization")?.replace("Bearer ", "");
  if (!auth || auth !== c.env.ADMIN_TOKEN) return c.json({ error: "Unauthorized" }, 401);
  const id = c.req.param("id");
  const data = await c.req.json();
  await c.env.DB.prepare(
    "UPDATE sources SET name = ?, base_url = ?, language = ?, enabled = ?, adapter_key = ?, config_json = ? WHERE id = ?"
  )
    .bind(data.name, data.baseUrl, data.language, data.enabled ? 1 : 0, data.adapterKey, JSON.stringify(data.config ?? {}), id)
    .run();
  return c.json({ ok: true });
});

app.delete("/admin/sources/:id", async (c) => {
  const auth = c.req.header("authorization")?.replace("Bearer ", "");
  if (!auth || auth !== c.env.ADMIN_TOKEN) return c.json({ error: "Unauthorized" }, 401);
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM sources WHERE id = ?").bind(id).run();
  return c.json({ ok: true });
});

app.post("/library", async (c) => {
  const body = await c.req.json();
  await c.env.DB.prepare("INSERT INTO library (id, user_id, manga_id) VALUES (?, ?, ?)")
    .bind(crypto.randomUUID(), body.userId, body.mangaId)
    .run();
  return c.json({ ok: true });
});

app.get("/library/:userId", async (c) => {
  const userId = c.req.param("userId");
  const result = await c.env.DB.prepare("SELECT * FROM library WHERE user_id = ?").bind(userId).all();
  return c.json(result.results ?? []);
});

app.post("/favorites", async (c) => {
  const body = await c.req.json();
  await c.env.DB.prepare("INSERT INTO favorites (id, user_id, manga_id) VALUES (?, ?, ?)")
    .bind(crypto.randomUUID(), body.userId, body.mangaId)
    .run();
  return c.json({ ok: true });
});

app.get("/favorites/:userId", async (c) => {
  const userId = c.req.param("userId");
  const result = await c.env.DB.prepare("SELECT * FROM favorites WHERE user_id = ?").bind(userId).all();
  return c.json(result.results ?? []);
});

app.post("/progress", async (c) => {
  const body = await c.req.json();
  await c.env.DB.prepare(
    "INSERT INTO progress (id, user_id, chapter_id, page_index) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, chapter_id) DO UPDATE SET page_index = excluded.page_index, updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ','now'))"
  )
    .bind(crypto.randomUUID(), body.userId, body.chapterId, body.pageIndex)
    .run();
  return c.json({ ok: true });
});

app.get("/progress/:userId", async (c) => {
  const userId = c.req.param("userId");
  const result = await c.env.DB.prepare("SELECT * FROM progress WHERE user_id = ?").bind(userId).all();
  return c.json(result.results ?? []);
});

app.post("/categories", async (c) => {
  const body = await c.req.json();
  await c.env.DB.prepare("INSERT INTO categories (id, user_id, name) VALUES (?, ?, ?)")
    .bind(crypto.randomUUID(), body.userId, body.name)
    .run();
  return c.json({ ok: true });
});

app.get("/categories/:userId", async (c) => {
  const userId = c.req.param("userId");
  const result = await c.env.DB.prepare("SELECT * FROM categories WHERE user_id = ?").bind(userId).all();
  return c.json(result.results ?? []);
});

export default {
  fetch: app.fetch,
};

export { RateLimiterDO };
