import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HistoryEntry } from "@/types/lore";

interface HistoryState {
  entries: HistoryEntry[];
  addEntry: (entry: HistoryEntry) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (entry) => set({ entries: [entry, ...get().entries] }),
      clearHistory: () => set({ entries: [] }),
    }),
    { name: "llb_history_v1" },
  ),
);
