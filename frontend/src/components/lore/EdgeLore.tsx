import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import { Sparkles } from "lucide-react";
import type { LoreEdge } from "@/types/lore";
import { useBoardStore, edgeKey } from "@/store/boardStore";
import { useUiStore } from "@/store/uiStore";

function EdgeLoreImpl(props: EdgeProps<LoreEdge>) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    source,
    target,
    selected,
  } = props;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const nodes = useBoardStore((s) => s.nodes);
  const loreMap = useBoardStore((s) => s.loreMap);
  const setActiveTab = useUiStore((s) => s.setActiveTab);
  const setSelection = useUiStore((s) => s.setSelection);

  const sourceNode = nodes.find((n) => n.id === source);
  const targetNode = nodes.find((n) => n.id === target);
  const key =
    sourceNode && targetNode
      ? edgeKey(sourceNode.data.name, targetNode.data.name)
      : "";
  const lore = key ? loreMap[key] : undefined;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? "#a78bfa" : "#7c5cd8",
          strokeWidth: selected ? 2.5 : 2,
          opacity: selected ? 1 : 0.75,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelection([], id);
              setActiveTab("lore");
            }}
            className="flex items-center gap-1 rounded-full border border-purple-500/40 bg-[#1a1a24] px-2 py-1 text-[10px] text-purple-200 shadow hover:bg-purple-500/20"
            title={lore ?? "Generate lore"}
          >
            <Sparkles className="h-3 w-3" />
            {lore ? lore.slice(0, 40) + (lore.length > 40 ? "…" : "") : "Generate"}
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const EdgeLore = memo(EdgeLoreImpl);
