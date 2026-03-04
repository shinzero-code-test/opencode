export type Language = "ar" | "en";

export interface MangaSummary {
  id: string;
  source: string;
  title: string;
  coverUrl?: string;
  language: Language;
  rating?: number;
  year?: number;
  genres?: string[];
}

export interface MangaDetails extends MangaSummary {
  description?: string;
  status?: string;
  author?: string;
  artist?: string;
  altTitles?: string[];
}

export interface Chapter {
  id: string;
  mangaId: string;
  source: string;
  title?: string;
  number?: number;
  language: Language;
  publishAt?: string;
}

export interface Page {
  index: number;
  imageUrl: string;
}

export interface SearchFilters {
  genres?: string[];
  status?: string;
  ratingMin?: number;
  year?: number;
  language?: Language;
}

export interface SearchResult {
  source: string;
  items: MangaSummary[];
}
