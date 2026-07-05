import { useState } from "react";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { useBoardStore } from "@/store/boardStore";
import { useUiStore } from "@/store/uiStore";
import type { NodeType } from "@/types/lore";
import { generateAvatar } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TYPES: NodeType[] = ["character", "location", "organization", "event"];

export function AddNodePanel() {
  const [name, setName] = useState("");
  const [type, setType] = useState<NodeType>("character");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const addNode = useBoardStore((s) => s.addNode);
  const nodes = useBoardStore((s) => s.nodes);
  const setActiveTab = useUiStore((s) => s.setActiveTab);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Name is required");
      return;
    }
    if (trimmedName.length > 80) {
      toast.error("Name must be under 80 chars");
      return;
    }

    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      toast.error("Description is required so the AI can draw the avatar.");
      return;
    }

    setIsGenerating(true);

    try {
      const { image_url } = await generateAvatar(
        trimmedName,
        type,
        trimmedDesc,
      );

      addNode({
        id: nanoid(8),
        type: "loreNode",
        position: {
          x: 200 + Math.random() * 300,
          y: 150 + Math.random() * 200,
        },
        data: {
          name: trimmedName,
          type,
          description: trimmedDesc,
          avatarUrl: image_url,
        },
      });

      toast.success(`${trimmedName} added to the board.`);
      setName("");
      setDescription("");
      if (nodes.length >= 1) setActiveTab("lore");
    } catch {
      toast.error(
        "Avatar generation failed. Check your API key and try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-[#e8e8f0]">
        <Plus className="h-4 w-4 text-purple-400" /> Add Node
      </h2>
      <div>
        <label className="mb-1 block text-xs text-[#8888a8]">Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Aelindra"
          maxLength={80}
          disabled={isGenerating}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-[#8888a8]">Type</label>
        <Select
          value={type}
          onValueChange={(v) => setType(v as NodeType)}
          disabled={isGenerating}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPES.map((t) => (
              <SelectItem key={t} value={t} className="capitalize">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-[#8888a8]">
          Description{" "}
          <span className="font-medium text-purple-400">
            (required — fuels the AI portrait)
          </span>
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="A rogue elven mage with glowing purple eyes and a scarred cheek…"
          disabled={isGenerating}
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-60"
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating portrait…
          </>
        ) : (
          "Add to Board"
        )}
      </Button>
    </form>
  );
}
