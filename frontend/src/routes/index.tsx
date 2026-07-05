import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/lore/Header";
import { Sidebar } from "@/components/lore/Sidebar";
import { LoreBoard } from "@/components/lore/LoreBoard";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Living Lore Board — AI Fantasy World Builder" },
      {
        name: "description",
        content:
          "Build an interactive knowledge graph of your fantasy world. Generate atmospheric lore, character portraits, and extract entities from prose with AI.",
      },
      { property: "og:title", content: "Living Lore Board" },
      {
        property: "og:description",
        content:
          "AI-powered fantasy world-building: nodes, lore, portraits, and NLP entity import.",
      },
    ],
  }),
});

function Index() {
  return (
    <div className="dark flex h-screen w-screen flex-col overflow-hidden bg-[#0f0f13] text-[#e8e8f0]">
      <Header />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <LoreBoard />
        </main>
      </div>
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}
