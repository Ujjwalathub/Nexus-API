import { useState } from "react";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";
import type { EntityItem } from "@/types/lore";
import { useBoardStore } from "@/store/boardStore";
import { extractEntities } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const MAX = 512;

// Badge colour per entity type
const TYPE_COLOURS: Record<string, string> = {
  character:    "bg-purple-900/60 text-purple-300",
  location:     "bg-blue-900/60   text-blue-300",
  organization: "bg-amber-900/60  text-amber-300",
  event:        "bg-rose-900/60   text-rose-300",
};

export function ExtractPanel() {
  const [text, setText]                   = useState("");
  const [loading, setLoading]             = useState(false);
  const [entities, setEntities]           = useState<EntityItem[]>([]);
  const [checked, setChecked]             = useState<Record<string, boolean>>({});
  const [selectedIdx, setSelectedIdx]     = useState<number | null>(null);

  const nodes   = useBoardStore((s) => s.nodes);
  const addNode = useBoardStore((s) => s.addNode);

  const existingNames = new Set(nodes.map((n) => n.data.name.toLowerCase()));

  // ── Extract ──────────────────────────────────────────────────────────────
  const handleExtract = async () => {
    setLoading(true);
    setSelectedIdx(null);
    try {
      const res = await extractEntities(text.slice(0, MAX));
      setEntities(res.entities);
      const init: Record<string, boolean> = {};
      res.entities.forEach((e, i) => {
        init[i] = !existingNames.has(e.name.toLowerCase());
      });
      setChecked(init);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Add all checked ───────────────────────────────────────────────────────
  const handleAdd = () => {
    let added = 0;
    entities.forEach((e, i) => {
      if (!checked[i]) return;
      if (existingNames.has(e.name.toLowerCase())) return;
      addNode({
        id:       nanoid(8),
        type:     "loreNode",
        position: { x: 100 + Math.random() * 600, y: 100 + Math.random() * 400 },
        data:     { name: e.name, type: e.type },
      });
      added++;
    });
    toast.success(`${added} ${added === 1 ? "entity" : "entities"} added to the board.`);
    setEntities([]);
    setSelectedIdx(null);
    setText("");
  };

  // ── Export single entity from detail pane ────────────────────────────────
  const handleExportOne = (e: EntityItem) => {
    if (existingNames.has(e.name.toLowerCase())) {
      toast.warning(`"${e.name}" is already on the board.`);
      return;
    }
    addNode({
      id:       nanoid(8),
      type:     "loreNode",
      position: { x: 100 + Math.random() * 600, y: 100 + Math.random() * 400 },
      data:     { name: e.name, type: e.type },
    });
    toast.success(`"${e.name}" added to the board.`);
    setSelectedIdx(null);
  };

  const selectedEntity = selectedIdx !== null ? entities[selectedIdx] : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-[#e8e8f0]">
        <BookOpen className="h-4 w-4 text-purple-400" /> Import from Text
      </h2>

      <Textarea
        rows={6}
        value={text}
        maxLength={MAX}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your story prose…"
      />

      <div className="flex items-center justify-between text-xs text-[#8888a8]">
        <span>{text.length}/{MAX} chars</span>
      </div>

      <Button
        onClick={handleExtract}
        disabled={loading || !text.trim()}
        className="w-full bg-purple-600 hover:bg-purple-500"
      >
        {loading ? "Analysing…" : "Extract & Import"}
      </Button>

      {entities.length > 0 && (
        <div className="rounded-md border border-[#2e2e40] bg-[#0f0f13] p-3 space-y-3">
          <p className="text-xs text-[#8888a8]">
            Found {entities.length} {entities.length === 1 ? "entity" : "entities"} — click to inspect, check to bulk-add:
          </p>

          {/* ── Two-column layout: list + detail ── */}
          <div className="flex gap-3">

            {/* LEFT: entity list */}
            <ul className="flex-1 min-w-0 space-y-1">
              {entities.map((e, i) => {
                const exists     = existingNames.has(e.name.toLowerCase());
                const isSelected = selectedIdx === i;
                const badgeClass = TYPE_COLOURS[e.type] ?? "bg-[#242433] text-[#8888a8]";

                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => setSelectedIdx(isSelected ? null : i)}
                      className={[
                        "w-full flex items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500",
                        isSelected
                          ? "bg-purple-900/40 border border-purple-700/60"
                          : "border border-transparent hover:bg-[#1a1a24]",
                        exists ? "opacity-50" : "",
                      ].join(" ")}
                    >
                      {/* Checkbox — stop propagation so clicking it doesn't also toggle selection */}
                      <span onClick={(ev) => ev.stopPropagation()}>
                        <Checkbox
                          checked={checked[i] ?? false}
                          disabled={exists}
                          onCheckedChange={(v) =>
                            setChecked((c) => ({ ...c, [i]: !!v }))
                          }
                        />
                      </span>

                      <span className="truncate flex-1 text-[#e8e8f0]">{e.name}</span>

                      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] uppercase font-medium ${badgeClass}`}>
                        {e.type}
                      </span>

                      {exists && (
                        <span className="shrink-0 text-[10px] text-[#8888a8]">on board</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* RIGHT: detail pane */}
            <div className="w-36 shrink-0 rounded border border-[#2e2e40] bg-[#141420] p-2 text-xs flex flex-col justify-between min-h-[6rem]">
              {selectedEntity ? (
                <>
                  <div className="space-y-1">
                    <p className="font-semibold text-[#e8e8f0] leading-tight break-words">
                      {selectedEntity.name}
                    </p>
                    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] uppercase font-medium ${TYPE_COLOURS[selectedEntity.type] ?? "bg-[#242433] text-[#8888a8]"}`}>
                      {selectedEntity.type}
                    </span>
                    {existingNames.has(selectedEntity.name.toLowerCase()) && (
                      <p className="text-[#8888a8] mt-1">Already on board</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExportOne(selectedEntity)}
                    disabled={existingNames.has(selectedEntity.name.toLowerCase())}
                    className="mt-2 w-full rounded bg-purple-700 hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1 text-[11px] font-medium text-white transition-colors"
                  >
                    Export to Board
                  </button>
                </>
              ) : (
                <p className="text-[#8888a8] italic text-center my-auto">
                  Select an item to view details…
                </p>
              )}
            </div>
          </div>

          {/* Bulk-add footer */}
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!Object.values(checked).some(Boolean)}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40"
          >
            Add Selected to Board
          </Button>
        </div>
      )}
    </div>
  );
}
