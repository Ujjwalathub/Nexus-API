import { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { Copy, Link2, Link2Off, RefreshCw, Sparkles, X } from "lucide-react";
import { useBoardStore, edgeKey } from "@/store/boardStore";
import { useUiStore } from "@/store/uiStore";
import { useHistoryStore } from "@/store/historyStore";
import { generateLore } from "@/lib/api";
import type { NodeRef } from "@/types/lore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const MAX_PINS = 6;

// Badge colour matching NodeCard TYPE_META colours
const TYPE_BADGE: Record<string, string> = {
  character:    "bg-amber-500/15 text-amber-300",
  location:     "bg-emerald-500/15 text-emerald-300",
  organization: "bg-blue-500/15 text-blue-300",
  event:        "bg-rose-500/15 text-rose-300",
};

export function LorePanel() {
  const nodes      = useBoardStore((s) => s.nodes);
  const edges      = useBoardStore((s) => s.edges);
  const loreMap    = useBoardStore((s) => s.loreMap);
  const setLore    = useBoardStore((s) => s.setLore);
  const addEdge    = useBoardStore((s) => s.addEdge);

  const {
    selectedNodeIds,
    selectedEdgeId,
    setSelection,
    isLinkingMode,
    lorePinIds,
    setLinkingMode,
    toggleLorePin,
    clearLorePins,
  } = useUiStore();

  const addEntry   = useHistoryStore((s) => s.addEntry);
  const [loading, setLoading] = useState(false);

  // ── Resolve pinned nodes ──────────────────────────────────────────────────
  const pinnedNodes = useMemo(
    () => lorePinIds.map((id) => nodes.find((n) => n.id === id)).filter(Boolean) as typeof nodes,
    [lorePinIds, nodes],
  );

  // ── Legacy 2-node path (edge click or Shift+click) ────────────────────────
  const { legacySource, legacyTarget, legacyEdgeId } = useMemo(() => {
    if (!isLinkingMode) {
      if (selectedEdgeId) {
        const edge = edges.find((e) => e.id === selectedEdgeId);
        if (edge) {
          const s = nodes.find((n) => n.id === edge.source);
          const t = nodes.find((n) => n.id === edge.target);
          return { legacySource: s, legacyTarget: t, legacyEdgeId: edge.id };
        }
      }
      if (selectedNodeIds.length === 2) {
        const s = nodes.find((n) => n.id === selectedNodeIds[0]);
        const t = nodes.find((n) => n.id === selectedNodeIds[1]);
        return { legacySource: s, legacyTarget: t, legacyEdgeId: null };
      }
    }
    return { legacySource: undefined, legacyTarget: undefined, legacyEdgeId: null };
  }, [isLinkingMode, selectedEdgeId, selectedNodeIds, nodes, edges]);

  // Legacy lore lookup key (2-node)
  const legacyKey =
    legacySource && legacyTarget
      ? edgeKey(legacySource.data.name, legacyTarget.data.name)
      : "";
  const legacyLore = legacyKey ? loreMap[legacyKey] : undefined;

  // ── Multi-node lore key (sorted for consistency) ─────────────────────────
  const multiKey = useMemo(
    () =>
      pinnedNodes.length >= 2
        ? pinnedNodes
            .map((n) => n.data.name.toLowerCase())
            .sort()
            .join("::")
        : "",
    [pinnedNodes],
  );
  const multiLore = multiKey ? loreMap[multiKey] : undefined;

  // ── Generate (multi-node path) ────────────────────────────────────────────
  const handleGenerateMulti = async () => {
    if (pinnedNodes.length < 2) return;
    setLoading(true);
    const nodeRefs: NodeRef[] = pinnedNodes.map((n) => ({
      name: n.data.name,
      type: n.data.type,
    }));
    try {
      const res = await generateLore(nodeRefs);
      setLore(multiKey, res.lore);
      addEntry({ id: nanoid(8), timestamp: Date.now(), nodes: nodeRefs, lore: res.lore });
      toast.success("Lore woven!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate lore");
    } finally {
      setLoading(false);
    }
  };

  // ── Generate (legacy 2-node path) ─────────────────────────────────────────
  const handleGenerateLegacy = async () => {
    if (!legacySource || !legacyTarget) return;
    setLoading(true);
    const nodeRefs: NodeRef[] = [
      { name: legacySource.data.name, type: legacySource.data.type },
      { name: legacyTarget.data.name, type: legacyTarget.data.type },
    ];
    try {
      const res = await generateLore(nodeRefs);
      setLore(legacyKey, res.lore);

      let edgeId = legacyEdgeId;
      if (!edgeId) {
        edgeId = nanoid(8);
        addEdge({
          id: edgeId,
          source: legacySource.id,
          target: legacyTarget.id,
          type: "loreEdge",
          data: {},
        });
        setSelection([], edgeId);
      }

      addEntry({ id: nanoid(8), timestamp: Date.now(), nodes: nodeRefs, lore: res.lore });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate lore");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const displayLore = isLinkingMode ? multiLore : legacyLore;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#e8e8f0]">
          <Sparkles className="h-4 w-4 text-purple-400" /> Generate Lore
        </h2>
        {/* Toggle linking mode */}
        <button
          type="button"
          onClick={() => setLinkingMode(!isLinkingMode)}
          title={isLinkingMode ? "Exit multi-select mode" : "Enter multi-select mode (2–6 nodes)"}
          className={cn(
            "flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors",
            isLinkingMode
              ? "bg-purple-600/80 text-white hover:bg-purple-500"
              : "bg-[#2e2e40] text-[#8888a8] hover:text-[#e8e8f0]",
          )}
        >
          {isLinkingMode ? (
            <><Link2Off className="h-3 w-3" /> Exit Multi</>
          ) : (
            <><Link2 className="h-3 w-3" /> Multi (2–6)</>
          )}
        </button>
      </div>

      {/* ── MULTI-NODE MODE ── */}
      {isLinkingMode ? (
        <div className="space-y-2">
          <p className="text-xs text-[#8888a8]">
            Click nodes on the board to select them ({lorePinIds.length}/{MAX_PINS} selected).
            {lorePinIds.length >= MAX_PINS && (
              <span className="ml-1 text-amber-400"> Maximum reached.</span>
            )}
          </p>

          {/* Pinned nodes list */}
          {pinnedNodes.length > 0 ? (
            <ul className="space-y-1">
              {pinnedNodes.map((n, i) => (
                <li
                  key={n.id}
                  className="flex items-center gap-2 rounded bg-[#1a1a24] px-2 py-1.5 text-sm"
                >
                  <span className="w-4 shrink-0 text-center text-[10px] text-[#8888a8]">{i + 1}</span>
                  <span className="flex-1 truncate text-[#e8e8f0]">{n.data.name}</span>
                  <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[10px] uppercase font-medium", TYPE_BADGE[n.data.type] ?? "bg-[#242433] text-[#8888a8]")}>
                    {n.data.type}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleLorePin(n.id)}
                    className="shrink-0 text-[#8888a8] hover:text-rose-400"
                    aria-label={`Remove ${n.data.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-md border border-dashed border-[#2e2e40] p-4 text-sm text-[#8888a8]">
              Click 2–6 nodes on the board to weave lore between them.
            </p>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleGenerateMulti}
              disabled={loading || pinnedNodes.length < 2}
              className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-40"
            >
              {loading ? "Weaving…" : multiLore ? "Re-weave" : "Weave Lore"}
            </Button>
            {pinnedNodes.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearLorePins}
                className="shrink-0 text-[#8888a8] hover:text-rose-400"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* ── LEGACY 2-NODE / EDGE MODE ── */
        <>
          {!legacySource || !legacyTarget ? (
            <p className="rounded-md border border-dashed border-[#2e2e40] p-4 text-sm text-[#8888a8]">
              Select two nodes (Shift+click) or an edge to generate lore, or use{" "}
              <strong className="text-[#e8e8f0]">Multi (2–6)</strong> to weave up to six entities at once.
            </p>
          ) : (
            <div className="space-y-2 rounded-md border border-[#2e2e40] bg-[#0f0f13] p-3 text-sm">
              <div>
                <span className="text-xs text-[#8888a8]">Source: </span>
                <span className="text-[#e8e8f0]">{legacySource.data.name}</span>
                <span className="ml-1 text-xs text-[#8888a8]">({legacySource.data.type})</span>
              </div>
              <div>
                <span className="text-xs text-[#8888a8]">Target: </span>
                <span className="text-[#e8e8f0]">{legacyTarget.data.name}</span>
                <span className="ml-1 text-xs text-[#8888a8]">({legacyTarget.data.type})</span>
              </div>
            </div>
          )}

          {legacySource && legacyTarget && (
            <Button
              onClick={handleGenerateLegacy}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500"
            >
              {loading ? "Generating…" : legacyLore ? "Regenerate" : "Generate Lore"}
            </Button>
          )}
        </>
      )}

      {/* ── Lore output (shared) ── */}
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full bg-[#242433]" />
          <Skeleton className="h-4 w-11/12 bg-[#242433]" />
          <Skeleton className="h-4 w-9/12 bg-[#242433]" />
          <Skeleton className="h-4 w-10/12 bg-[#242433]" />
        </div>
      ) : displayLore ? (
        <div className="space-y-2 rounded-md border border-[#2e2e40] bg-[#0f0f13] p-3">
          <p
            className="text-sm leading-relaxed text-[#e8e8f0]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {displayLore}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={isLinkingMode ? handleGenerateMulti : handleGenerateLegacy}
              disabled={loading}
              className="text-[#8888a8] hover:text-[#e8e8f0]"
            >
              <RefreshCw className="mr-1 h-3 w-3" /> Regenerate
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                navigator.clipboard.writeText(displayLore);
                toast.success("Copied!");
              }}
              className="text-[#8888a8] hover:text-[#e8e8f0]"
            >
              <Copy className="mr-1 h-3 w-3" /> Copy
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
