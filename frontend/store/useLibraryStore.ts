import { create } from "zustand";

interface LibraryItem {
  id: string;
  title: string;
  source: string;
  coverUrl?: string;
  lastChapter?: string;
}

interface LibraryState {
  items: LibraryItem[];
  addItem: (item: LibraryItem) => void;
}

export const useLibraryStore = create<LibraryState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [item, ...state.items] }))
}));
