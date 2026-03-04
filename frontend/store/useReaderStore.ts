import { create } from "zustand";

type Mode = "vertical" | "horizontal" | "single" | "double";

interface ReaderState {
  mode: Mode;
  zoom: number;
  setMode: (mode: Mode) => void;
  setZoom: (zoom: number) => void;
}

export const useReaderStore = create<ReaderState>((set) => ({
  mode: "vertical",
  zoom: 1,
  setMode: (mode) => set({ mode }),
  setZoom: (zoom) => set({ zoom })
}));
