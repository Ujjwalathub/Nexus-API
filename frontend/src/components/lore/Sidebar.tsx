import { BookOpen, Palette, Plus, ScrollText, Sparkles } from "lucide-react";
import { useUiStore, type ActiveTab } from "@/store/uiStore";
import { cn } from "@/lib/utils";
import { AddNodePanel } from "./AddNodePanel";
import { LorePanel } from "./LorePanel";
import { AvatarPanel } from "./AvatarPanel";
import { ExtractPanel } from "./ExtractPanel";
import { HistoryPanel } from "./HistoryPanel";

const TABS: { id: ActiveTab; label: string; icon: typeof Plus }[] = [
  { id: "add", label: "Add", icon: Plus },
  { id: "lore", label: "Lore", icon: Sparkles },
  { id: "avatar", label: "Avatar", icon: Palette },
  { id: "extract", label: "Extract", icon: BookOpen },
  { id: "history", label: "History", icon: ScrollText },
];

export function Sidebar() {
  const { activeTab, setActiveTab } = useUiStore();

  return (
    <aside className="flex h-full w-[340px] flex-col border-r border-[#2e2e40] bg-[#1a1a24]">
      <nav className="grid grid-cols-5 border-b border-[#2e2e40]">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex flex-col items-center gap-1 py-3 text-[10px] uppercase tracking-wide transition",
                active
                  ? "border-b-2 border-purple-500 text-purple-300"
                  : "text-[#8888a8] hover:text-[#e8e8f0]",
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </nav>
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "add" && <AddNodePanel />}
        {activeTab === "lore" && <LorePanel />}
        {activeTab === "avatar" && <AvatarPanel />}
        {activeTab === "extract" && <ExtractPanel />}
        {activeTab === "history" && <HistoryPanel />}
      </div>
    </aside>
  );
}
