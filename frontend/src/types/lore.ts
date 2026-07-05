import type { Edge, Node } from "@xyflow/react";

export type NodeType = "character" | "location" | "organization" | "event";

export interface LoreNodeData extends Record<string, unknown> {
  name: string;
  type: NodeType;
  description?: string;
  avatarUrl?: string;
  /** Injected at render time by LoreBoard when in multi-select linking mode. */
  lorePinned?: boolean;
}

export type LoreNode = Node<LoreNodeData, "loreNode">;

export interface LoreEdgeData extends Record<string, unknown> {
  lore?: string;
}

export type LoreEdge = Edge<LoreEdgeData, "loreEdge">;

export interface NodeRef {
  name: string;
  type: NodeType;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  /** All nodes involved in this lore generation (2–6). */
  nodes: NodeRef[];
  /** @deprecated kept for backwards-compat with persisted entries */
  sourceNode?: NodeRef;
  /** @deprecated kept for backwards-compat with persisted entries */
  targetNode?: NodeRef;
  lore: string;
}

export interface EntityItem {
  name: string;
  type: NodeType;
}
