import type { Chapter, MangaDetails, MangaSummary, Page, SearchFilters } from "../types";

export interface Scraper {
  key: string;
  name: string;
  baseUrl: string;
  language: "ar" | "en";
  supportsSearch: boolean;
  supportsFilters: boolean;
  search(query: string, filters?: SearchFilters): Promise<MangaSummary[]>;
  getManga(mangaId: string): Promise<MangaDetails>;
  getChapters(mangaId: string): Promise<Chapter[]>;
  getPages(chapterId: string): Promise<Page[]>;
}
