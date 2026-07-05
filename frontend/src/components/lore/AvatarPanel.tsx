import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Palette } from "lucide-react";
import { useBoardStore } from "@/store/boardStore";
import { useUiStore } from "@/store/uiStore";
import { generateAvatar } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function AvatarPanel() {
  const nodes = useBoardStore((s) => s.nodes);
  const updateNodeData = useBoardStore((s) => s.updateNodeData);
  const { selectedNodeIds } = useUiStore();
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const node =
    selectedNodeIds.length === 1
      ? nodes.find((n) => n.id === selectedNodeIds[0])
      : undefined;

  useEffect(() => {
    if (loading) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading]);

  const handleGenerate = async () => {
    if (!node) return;
    setLoading(true);
    try {
      const res = await generateAvatar(
        node.data.name,
        node.data.type,
        node.data.description ?? "",
      );
      updateNodeData(node.id, { avatarUrl: res.image_url });
      toast.success("Portrait generated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Avatar failed");
    } finally {
      setLoading(false);
    }
  };

  if (!node) {
    return (
      <div className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#e8e8f0]">
          <Palette className="h-4 w-4 text-purple-400" /> Character Portrait
        </h2>
        <p className="rounded-md border border-dashed border-[#2e2e40] p-4 text-sm text-[#8888a8]">
          Select a single character node to generate a portrait.
        </p>
      </div>
    );
  }

  if (node.data.type !== "character") {
    return (
      <div className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#e8e8f0]">
          <Palette className="h-4 w-4 text-purple-400" /> Character Portrait
        </h2>
        <p className="rounded-md border border-dashed border-[#2e2e40] p-4 text-sm text-[#8888a8]">
          Portrait generation is only available for character nodes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-[#e8e8f0]">
        <Palette className="h-4 w-4 text-purple-400" /> Character Portrait
      </h2>
      <div className="rounded-md border border-[#2e2e40] bg-[#0f0f13] p-3 text-sm">
        <span className="text-xs text-[#8888a8]">Character: </span>
        <span className="text-[#e8e8f0]">{node.data.name}</span>
      </div>
      <Button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-500"
      >
        {loading
          ? `Generating… ${elapsed}s`
          : node.data.avatarUrl
            ? "Regenerate"
            : "Generate Portrait"}
      </Button>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="aspect-square w-full bg-[#242433]" />
          <p className="text-center text-xs text-[#8888a8]">
            ⏱ Generation may take ~30s (model cold start)
          </p>
        </div>
      ) : node.data.avatarUrl ? (
        <div className="space-y-2">
          <img
            src={node.data.avatarUrl}
            alt={`${node.data.name} portrait`}
            className="w-full rounded-md border border-[#2e2e40]"
          />
          <a
            href={node.data.avatarUrl}
            download={`${node.data.name}.jpg`}
            className="inline-flex w-full items-center justify-center gap-1 rounded-md border border-[#2e2e40] py-2 text-sm text-[#e8e8f0] hover:bg-[#242433]"
          >
            <Download className="h-3 w-3" /> Download
          </a>
        </div>
      ) : null}
    </div>
  );
}
