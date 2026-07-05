import { useCallback, useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type NodeMouseHandler,
  type EdgeMouseHandler,
  type OnSelectionChangeFunc,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toast } from "sonner";
import { useBoardStore } from "@/store/boardStore";
import { useUiStore } from "@/store/uiStore";
import { NodeCard } from "./NodeCard";
import { EdgeLore } from "./EdgeLore";
import type { LoreNode, NodeType } from "@/types/lore";

const nodeTypes = { loreNode: NodeCard };
const edgeTypes = { loreEdge: EdgeLore };

const MINIMAP_COLORS: Record<NodeType, string> = {
  character: "#f59e0b",
  location: "#10b981",
  organization: "#3b82f6",
  event: "#f43f5e",
};

const MAX_PINS = 6;

function Canvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    triggerLoreGeneration,
  } = useBoardStore();
  const setSelection   = useUiStore((s) => s.setSelection);
  const setActiveTab   = useUiStore((s) => s.setActiveTab);
  const isLinkingMode  = useUiStore((s) => s.isLinkingMode);
  const lorePinIds     = useUiStore((s) => s.lorePinIds);
  const toggleLorePin  = useUiStore((s) => s.toggleLorePin);

  const handleConnect = useCallback(
    (conn: Parameters<typeof onConnect>[0]) => {
      const id = onConnect(conn);
      if (id) {
        setSelection([], id);
        setActiveTab("lore");
        // Fire-and-forget: auto-generate lore when a new edge is drawn
        void triggerLoreGeneration(id);
      }
    },
    [onConnect, triggerLoreGeneration, setSelection, setActiveTab],
  );

  const onSelectionChange: OnSelectionChangeFunc = useCallback(
    ({ nodes: selNodes, edges: selEdges }) => {
      setSelection(
        selNodes.map((n) => n.id),
        selEdges[0]?.id ?? null,
      );
    },
    [setSelection],
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (_e, node) => {
      const n = node as LoreNode;

      if (isLinkingMode) {
        const alreadyPinned = lorePinIds.includes(n.id);
        if (!alreadyPinned && lorePinIds.length >= MAX_PINS) {
          toast.warning(`You can only connect up to ${MAX_PINS} entities at a time.`);
          return;
        }
        toggleLorePin(n.id);
        setActiveTab("lore");
        return;
      }

      if (n.data.type === "character") setActiveTab("avatar");
    },
    [isLinkingMode, lorePinIds, toggleLorePin, setActiveTab],
  );

  const onEdgeClick: EdgeMouseHandler = useCallback(() => {
    setActiveTab("lore");
  }, [setActiveTab]);

  const miniMapNodeColor = useMemo(
    () => (node: { data?: unknown }) => {
      const data = node.data as { type?: NodeType } | undefined;
      return data?.type ? MINIMAP_COLORS[data.type] : "#7c5cd8";
    },
    [],
  );

  // Inject `lorePinned` into node data so NodeCard can show the highlight ring
  const augmentedNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        data: { ...n.data, lorePinned: lorePinIds.includes(n.id) },
      })),
    [nodes, lorePinIds],
  );

  return (
    <ReactFlow
      nodes={augmentedNodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={handleConnect}
      onSelectionChange={onSelectionChange}
      onNodeClick={onNodeClick}
      onEdgeClick={onEdgeClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      snapToGrid
      snapGrid={[20, 20]}
      fitView
      colorMode="dark"
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2e2e40" />
      <Controls className="!bg-[#1a1a24] !border-[#2e2e40]" />
      <MiniMap
        nodeColor={miniMapNodeColor}
        maskColor="rgba(15,15,19,0.7)"
        style={{ backgroundColor: "#1a1a24", border: "1px solid #2e2e40" }}
      />
    </ReactFlow>
  );
}

export function LoreBoard() {
  return (
    <div className="h-full w-full bg-[#0f0f13]">
      <ReactFlowProvider>
        <Canvas />
      </ReactFlowProvider>
    </div>
  );
}
