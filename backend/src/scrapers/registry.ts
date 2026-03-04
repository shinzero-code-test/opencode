import type { Env } from "../env";
import type { Scraper } from "./Scraper";
import { CheerioAdapter, type SelectorConfig } from "./cheerioAdapter";
import { sourceConfigs } from "./config";
import { MangaDexAdapter } from "./mangadex";
import { WebtoonsAdapter } from "./webtoons";

type SourceRow = {
  id: string;
  name: string;
  base_url: string;
  language: "ar" | "en";
  adapter_key: string;
  config_json?: string;
  enabled: number;
};

function createCheerioFromKey(env: Env, key: string, name: string, baseUrl: string, language: "ar" | "en", config?: string) {
  if (config) {
    const parsed = JSON.parse(config) as { selectors: SelectorConfig; searchParam?: string };
    return new CheerioAdapter(env, {
      key,
      name,
      baseUrl,
      language,
      selectors: parsed.selectors,
      searchQueryParam: parsed.searchParam
    });
  }
  const defaultConfig = sourceConfigs[key];
  if (!defaultConfig) {
    throw new Error(`Missing selector config for ${key}`);
  }
  return new CheerioAdapter(env, {
    key,
    name,
    baseUrl,
    language,
    selectors: defaultConfig.selectors,
    searchQueryParam: defaultConfig.searchParam
  });
}

export async function getScrapers(env: Env): Promise<Record<string, Scraper>> {
  const scrapers: Record<string, Scraper> = {
    mangadex: new MangaDexAdapter(env),
    webtoons: new WebtoonsAdapter(env),
    olympusatff: new CheerioAdapter(env, {
      key: "olympusatff",
      name: "Olympus ATFF",
      baseUrl: "https://olympustaff.com",
      language: "ar",
      selectors: sourceConfigs.olympusatff.selectors
    }),
    azuramoon: new CheerioAdapter(env, {
      key: "azuramoon",
      name: "AzuraMoon",
      baseUrl: "https://azoramoon.com",
      language: "ar",
      selectors: sourceConfigs.azuramoon.selectors
    }),
    "manga-starz": new CheerioAdapter(env, {
      key: "manga-starz",
      name: "Manga Starz",
      baseUrl: "https://manga-starz.net",
      language: "ar",
      selectors: sourceConfigs["manga-starz"].selectors
    }),
    mangalek: new CheerioAdapter(env, {
      key: "mangalek",
      name: "MangaLek",
      baseUrl: "https://mangalek.com",
      language: "ar",
      selectors: sourceConfigs.mangalek.selectors
    }),
    "mangakakalot-ar": new CheerioAdapter(env, {
      key: "mangakakalot-ar",
      name: "MangaKakalot Arabic",
      baseUrl: "https://mangakakalot.com",
      language: "ar",
      selectors: sourceConfigs["mangakakalot-ar"].selectors,
      searchQueryParam: sourceConfigs["mangakakalot-ar"].searchParam
    }),
    "3asq": new CheerioAdapter(env, {
      key: "3asq",
      name: "3asq",
      baseUrl: "https://3asq.org",
      language: "ar",
      selectors: sourceConfigs["3asq"].selectors
    }),
    mangaswat: new CheerioAdapter(env, {
      key: "mangaswat",
      name: "MangaSwat",
      baseUrl: "https://mangaswat.com",
      language: "ar",
      selectors: sourceConfigs.mangaswat.selectors
    }),
    mangaareab: new CheerioAdapter(env, {
      key: "mangaareab",
      name: "MangaAreaB",
      baseUrl: "https://mangaareab.com",
      language: "ar",
      selectors: sourceConfigs.mangaareab.selectors
    }),
    mangakakalot: new CheerioAdapter(env, {
      key: "mangakakalot",
      name: "MangaKakalot",
      baseUrl: "https://mangakakalot.com",
      language: "en",
      selectors: sourceConfigs.mangakakalot.selectors,
      searchQueryParam: sourceConfigs.mangakakalot.searchParam
    }),
    manganelo: new CheerioAdapter(env, {
      key: "manganelo",
      name: "Manganelo",
      baseUrl: "https://manganelo.com",
      language: "en",
      selectors: sourceConfigs.manganelo.selectors,
      searchQueryParam: sourceConfigs.manganelo.searchParam
    }),
    manganato: new CheerioAdapter(env, {
      key: "manganato",
      name: "ReadManganato",
      baseUrl: "https://readmanganato.com",
      language: "en",
      selectors: sourceConfigs.manganato.selectors,
      searchQueryParam: sourceConfigs.manganato.searchParam
    }),
    mangahere: new CheerioAdapter(env, {
      key: "mangahere",
      name: "MangaHere",
      baseUrl: "https://mangahere.cc",
      language: "en",
      selectors: sourceConfigs.mangahere.selectors
    })
  };

  try {
    const rows = await env.DB.prepare(
      "SELECT id, name, base_url, language, adapter_key, config_json, enabled FROM sources WHERE enabled = 1"
    ).all();
    const dynamic = rows.results as SourceRow[];
    for (const row of dynamic) {
      if (!row.adapter_key || row.adapter_key === "mangadex" || row.adapter_key === "webtoons") continue;
      try {
        const adapterKey = row.adapter_key === "cheerio" ? row.id : row.adapter_key;
        scrapers[row.id] = createCheerioFromKey(env, adapterKey, row.name, row.base_url, row.language, row.config_json);
      } catch {
        continue;
      }
    }
  } catch (error) {
    console.warn("Failed to load dynamic sources", error);
  }

  return scrapers;
}
