import { create } from "zustand";

export type ActiveTab = "add" | "lore" | "avatar" | "extract" | "history";

interface UiState {
  activeTab: ActiveTab;
  selectedNodeIds: string[];
  selectedEdgeId: string | null;

  /** Whether the board is in multi-node lore-linking mode. */
  isLinkingMode: boolean;
  /** Node IDs pinned for multi-node lore generation (2–6). */
  lorePinIds: string[];

  setActiveTab: (tab: ActiveTab) => void;
  setSelection: (nodeIds: string[], edgeId: string | null) => void;

  setLinkingMode: (on: boolean) => void;
  toggleLorePin: (nodeId: string) => void;
  clearLorePins: () => void;
}

const MAX_PINS = 6;

export const useUiStore = create<UiState>((set, get) => ({
  activeTab: "add",
  selectedNodeIds: [],
  selectedEdgeId: null,
  isLinkingMode: false,
  lorePinIds: [],

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelection: (nodeIds, edgeId) =>
    set({ selectedNodeIds: nodeIds, selectedEdgeId: edgeId }),

  setLinkingMode: (on) =>
    set({ isLinkingMode: on, lorePinIds: on ? get().lorePinIds : [] }),

  toggleLorePin: (nodeId) => {
    const { lorePinIds } = get();
    if (lorePinIds.includes(nodeId)) {
      // Deselect
      set({ lorePinIds: lorePinIds.filter((id) => id !== nodeId) });
    } else if (lorePinIds.length < MAX_PINS) {
      set({ lorePinIds: [...lorePinIds, nodeId] });
    }
    // If already at max, silently ignore (caller shows toast)
  },

  clearLorePins: () => set({ lorePinIds: [] }),
}));
