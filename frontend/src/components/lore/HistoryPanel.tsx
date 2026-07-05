import { toast } from "sonner";
import { Copy, ScrollText, Trash2 } from "lucide-react";
import { useHistoryStore } from "@/store/historyStore";
import { Button } from "@/components/ui/button";

export function HistoryPanel() {
  const entries = useHistoryStore((s) => s.entries);
  const clearHistory = useHistoryStore((s) => s.clearHistory);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#e8e8f0]">
          <ScrollText className="h-4 w-4 text-purple-400" /> Lore History
        </h2>
        {entries.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            className="text-[#8888a8] hover:text-rose-400"
            onClick={() => {
              if (confirm("Clear all history?")) clearHistory();
            }}
          >
            <Trash2 className="mr-1 h-3 w-3" /> Clear
          </Button>
        )}
      </div>
      {entries.length === 0 ? (
        <p className="rounded-md border border-dashed border-[#2e2e40] p-4 text-sm text-[#8888a8]">
          Your generated lore will appear here.
        </p>
      ) : (
        <ul className="space-y-2">
          {entries.map((e) => (
            <li
              key={e.id}
              className="space-y-2 rounded-md border border-[#2e2e40] bg-[#0f0f13] p-3"
            >
              <div className="text-xs text-purple-300">
                {/* Support both new `nodes[]` entries and old persisted sourceNode/targetNode entries */}
                {e.nodes
                  ? e.nodes.map((n) => n.name).join(" ↔ ")
                  : `${e.sourceNode?.name} ↔ ${e.targetNode?.name}`}
              </div>
              <p
                className="line-clamp-3 text-sm text-[#e8e8f0]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {e.lore}
              </p>
              <div className="flex items-center justify-between text-[10px] text-[#8888a8]">
                <span style={{ fontFamily: "monospace" }}>
                  {new Date(e.timestamp).toLocaleTimeString()}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(e.lore);
                    toast.success("Copied!");
                  }}
                  className="flex items-center gap-1 hover:text-[#e8e8f0]"
                >
                  <Copy className="h-3 w-3" /> Copy
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
