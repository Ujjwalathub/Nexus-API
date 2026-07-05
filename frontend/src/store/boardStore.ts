import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  addEdge as rfAddEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import { nanoid } from "nanoid";
import type { LoreEdge, LoreNode, LoreNodeData } from "@/types/lore";
import { generateLore } from "@/lib/api";
import { useHistoryStore } from "@/store/historyStore";

export function edgeKey(sourceName: string, targetName: string) {
  return `${sourceName.toLowerCase()}::${targetName.toLowerCase()}`;
}

interface BoardState {
  nodes: LoreNode[];
  edges: LoreEdge[];
  loreMap: Record<string, string>;

  addNode: (node: LoreNode) => void;
  updateNodeData: (id: string, data: Partial<LoreNodeData>) => void;
  removeNode: (id: string) => void;

  addEdge: (edge: LoreEdge) => void;
  removeEdge: (id: string) => void;
  setLore: (key: string, lore: string) => void;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => string | null;
  triggerLoreGeneration: (edgeId: string) => Promise<void>;

  clear: () => void;
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      loreMap: {},

      addNode: (node) => set({ nodes: [...get().nodes, node] }),
      updateNodeData: (id, data) =>
        set({
          nodes: get().nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
          ),
        }),
      removeNode: (id) =>
        set({
          nodes: get().nodes.filter((n) => n.id !== id),
          edges: get().edges.filter((e) => e.source !== id && e.target !== id),
        }),

      addEdge: (edge) => set({ edges: [...get().edges, edge] }),
      removeEdge: (id) =>
        set({ edges: get().edges.filter((e) => e.id !== id) }),
      setLore: (key, lore) =>
        set({ loreMap: { ...get().loreMap, [key]: lore } }),

      onNodesChange: (changes) =>
        set({ nodes: applyNodeChanges(changes, get().nodes) as LoreNode[] }),
      onEdgesChange: (changes) =>
        set({ edges: applyEdgeChanges(changes, get().edges) as LoreEdge[] }),
      onConnect: (connection) => {
        const edges = rfAddEdge(
          { ...connection, type: "loreEdge", data: {} },
          get().edges,
        ) as LoreEdge[];
        set({ edges });
        const created = edges[edges.length - 1];
        return created?.id ?? null;
      },

      triggerLoreGeneration: async (edgeId) => {
        const { nodes, edges, loreMap } = get();
        const edge = edges.find((e) => e.id === edgeId);
        if (!edge) return;
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);
        if (!sourceNode || !targetNode) return;

        const key = edgeKey(sourceNode.data.name, targetNode.data.name);
        // Skip if lore already exists for this pair
        if (loreMap[key]) return;

        const nodeRefs = [
          { name: sourceNode.data.name, type: sourceNode.data.type },
          { name: targetNode.data.name, type: targetNode.data.type },
        ];

        try {
          const res = await generateLore(nodeRefs);
          get().setLore(key, res.lore);
          useHistoryStore.getState().addEntry({
            id: nanoid(8),
            timestamp: Date.now(),
            nodes: nodeRefs,
            lore: res.lore,
          });
        } catch {
          // Generation failure is non-fatal — user can retry via LorePanel
        }
      },

      clear: () => set({ nodes: [], edges: [], loreMap: {} }),
    }),
    { name: "llb_board_v1" },
  ),
);
