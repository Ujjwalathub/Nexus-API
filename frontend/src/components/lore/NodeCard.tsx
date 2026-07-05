import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { MapPin, Shield, User, X, Zap } from "lucide-react";
import type { LoreNode, NodeType } from "@/types/lore";
import { useBoardStore } from "@/store/boardStore";
import { cn } from "@/lib/utils";

const TYPE_META: Record<
  NodeType,
  { icon: typeof User; color: string; ring: string; badge: string }
> = {
  character: {
    icon: User,
    color: "text-amber-400",
    ring: "border-l-amber-400",
    badge: "bg-amber-500/15 text-amber-300",
  },
  location: {
    icon: MapPin,
    color: "text-emerald-400",
    ring: "border-l-emerald-400",
    badge: "bg-emerald-500/15 text-emerald-300",
  },
  organization: {
    icon: Shield,
    color: "text-blue-400",
    ring: "border-l-blue-400",
    badge: "bg-blue-500/15 text-blue-300",
  },
  event: {
    icon: Zap,
    color: "text-rose-400",
    ring: "border-l-rose-400",
    badge: "bg-rose-500/15 text-rose-300",
  },
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function NodeCardImpl({ id, data, selected }: NodeProps<LoreNode>) {
  const meta = TYPE_META[data.type];
  const Icon = meta.icon;
  const removeNode = useBoardStore((s) => s.removeNode);

  return (
    <div
      className={cn(
        "group relative w-[180px] rounded-lg border border-l-4 bg-[#1a1a24] text-[#e8e8f0] shadow-lg transition",
        meta.ring,
        data.lorePinned
          ? "border-amber-400 ring-2 ring-amber-400/60"
          : selected
            ? "border-purple-500 ring-2 ring-purple-500/50"
            : "border-[#2e2e40]",
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-purple-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-purple-500" />
      <Handle type="target" position={Position.Left} className="!bg-purple-500" />
      <Handle type="source" position={Position.Right} className="!bg-purple-500" />

      <button
        onClick={(e) => {
          e.stopPropagation();
          removeNode(id);
        }}
        aria-label={`Delete ${data.name}`}
        className="absolute -right-2 -top-2 hidden h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white group-hover:flex"
      >
        <X className="h-3 w-3" />
      </button>

      <div className="flex items-center gap-3 p-3">
        {data.avatarUrl ? (
          <img
            src={data.avatarUrl}
            alt={`${data.name} portrait`}
            className="h-12 w-12 rounded-md object-cover"
          />
        ) : (
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-md bg-black/30 text-sm font-semibold",
              meta.color,
            )}
          >
            {initials(data.name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Icon className={cn("h-3.5 w-3.5", meta.color)} />
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                meta.badge,
              )}
            >
              {data.type}
            </span>
          </div>
          <div className="mt-1 line-clamp-2 text-[13px] font-semibold leading-tight">
            {data.name}
          </div>
        </div>
      </div>
    </div>
  );
}

export const NodeCard = memo(NodeCardImpl);
