import { load } from "cheerio";
import type { Chapter, MangaDetails, MangaSummary, Page, SearchFilters } from "../types";
import type { Env } from "../env";
import { ScraperBase } from "./base";
import type { Scraper } from "./Scraper";

export interface SelectorConfig {
  search: {
    path: string;
    item: string;
    title: string;
    url: string;
    cover?: string;
  };
  manga: {
    title: string;
    description?: string;
    cover?: string;
    status?: string;
    genres?: string;
    author?: string;
  };
  chapters: {
    list: string;
    item: string;
    title: string;
    url: string;
    number?: string;
    date?: string;
  };
  pages: {
    item: string;
    image: string;
  };
}

export interface CheerioAdapterOptions {
  key: string;
  name: string;
  baseUrl: string;
  language: "ar" | "en";
  selectors: SelectorConfig;
  supportsFilters?: boolean;
  searchQueryParam?: string;
}

export class CheerioAdapter extends ScraperBase implements Scraper {
  key: string;
  name: string;
  baseUrl: string;
  language: "ar" | "en";
  supportsSearch = true;
  supportsFilters = false;
  private selectors: SelectorConfig;
  private searchQueryParam: string;

  constructor(env: Env, options: CheerioAdapterOptions) {
    super(env);
    this.key = options.key;
    this.name = options.name;
    this.baseUrl = options.baseUrl;
    this.language = options.language;
    this.selectors = options.selectors;
    this.supportsFilters = options.supportsFilters ?? false;
    this.searchQueryParam = options.searchQueryParam ?? "s";
  }

  async search(query: string, _filters?: SearchFilters): Promise<MangaSummary[]> {
    const url = new URL(this.selectors.search.path, this.baseUrl);
    url.searchParams.set(this.searchQueryParam, query);
    const html = await this.fetchHtmlWithFallback(url.toString(), this.baseUrl);
    const $ = load(html);
    const results: MangaSummary[] = [];
    $(this.selectors.search.item).each((_, el) => {
      const title = $(el).find(this.selectors.search.title).text().trim();
      const href = $(el).find(this.selectors.search.url).attr("href") || "";
      if (!title || !href) return;
      const cover = this.selectors.search.cover
        ? $(el).find(this.selectors.search.cover).attr("src") || undefined
        : undefined;
      results.push({
        id: new URL(href, this.baseUrl).toString(),
        source: this.key,
        title,
        coverUrl: cover,
        language: this.language
      });
    });
    return results;
  }

  async getManga(mangaId: string): Promise<MangaDetails> {
    const html = await this.fetchHtmlWithFallback(mangaId, this.baseUrl);
    const $ = load(html);
    const title = $(this.selectors.manga.title).first().text().trim();
    if (!title) {
      throw new Error("Manga title not found");
    }
    const cover = this.selectors.manga.cover ? $(this.selectors.manga.cover).attr("src") || undefined : undefined;
    const description = this.selectors.manga.description ? $(this.selectors.manga.description).text().trim() : undefined;
    const status = this.selectors.manga.status ? $(this.selectors.manga.status).text().trim() : undefined;
    const genres = this.selectors.manga.genres
      ? $(this.selectors.manga.genres)
          .map((_, el) => $(el).text().trim())
          .get()
      : undefined;
    const author = this.selectors.manga.author ? $(this.selectors.manga.author).text().trim() : undefined;

    return {
      id: mangaId,
      source: this.key,
      title,
      coverUrl: cover,
      description,
      status,
      genres,
      author,
      language: this.language
    };
  }

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const html = await this.fetchHtmlWithFallback(mangaId, this.baseUrl);
    const $ = load(html);
    const list = $(this.selectors.chapters.list);
    const chapters: Chapter[] = [];
    list.find(this.selectors.chapters.item).each((_, el) => {
      const title = $(el).find(this.selectors.chapters.title).text().trim();
      const href = $(el).find(this.selectors.chapters.url).attr("href") || "";
      if (!href) return;
      const numberText = this.selectors.chapters.number
        ? $(el).find(this.selectors.chapters.number).text().trim()
        : undefined;
      const number = numberText ? Number.parseFloat(numberText.replace(/[^0-9.]+/g, "")) : undefined;
      const publishAt = this.selectors.chapters.date
        ? $(el).find(this.selectors.chapters.date).text().trim()
        : undefined;
      chapters.push({
        id: new URL(href, this.baseUrl).toString(),
        mangaId,
        source: this.key,
        title,
        number,
        language: this.language,
        publishAt
      });
    });
    return chapters;
  }

  async getPages(chapterId: string): Promise<Page[]> {
    const html = await this.fetchHtmlWithFallback(chapterId, this.baseUrl);
    const $ = load(html);
    const pages: Page[] = [];
    $(this.selectors.pages.item).each((index, el) => {
      const src = $(el).find(this.selectors.pages.image).attr("src") || $(el).attr("data-src") || "";
      if (!src) return;
      pages.push({ index, imageUrl: new URL(src, this.baseUrl).toString() });
    });
    return pages;
  }

  private async fetchHtmlWithFallback(url: string, referer: string): Promise<string> {
    try {
      return await this.fetchHtml(url, { referer });
    } catch {
      return this.fetchHtml(url, { referer, render: true });
    }
  }
}
