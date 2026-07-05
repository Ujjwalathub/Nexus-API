import { Sparkles } from "lucide-react";
import { useApiHealth } from "@/hooks/useApiHealth";
import { cn } from "@/lib/utils";

export function Header() {
  const healthy = useApiHealth();
  const label =
    healthy === null ? "Checking…" : healthy ? "API online" : "API offline";
  const dot =
    healthy === null
      ? "bg-amber-400 animate-pulse"
      : healthy
        ? "bg-emerald-400"
        : "bg-rose-500";

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#2e2e40] bg-[#1a1a24] px-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-400" />
        <h1 className="text-[15px] font-bold tracking-tight text-[#e8e8f0]">
          Living Lore Board
        </h1>
      </div>
      <div className="flex items-center gap-2 text-xs text-[#8888a8]">
        <span className={cn("h-2 w-2 rounded-full", dot)} />
        {label}
      </div>
    </header>
  );
}
