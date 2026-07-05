# Living Lore Board — Frontend Design Document

> **Version:** 1.0.0  
> **Stack:** React 18 + TypeScript + Vite  
> **Backend:** FastAPI (http://localhost:8000)  
> **Dev Server:** http://localhost:5173

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Tech Stack & Dependencies](#3-tech-stack--dependencies)
4. [Directory Structure](#4-directory-structure)
5. [API Contract](#5-api-contract)
6. [Pages & Routes](#6-pages--routes)
7. [Component Hierarchy](#7-component-hierarchy)
8. [State Management](#8-state-management)
9. [Feature Specifications](#9-feature-specifications)
   - 9.1 [Lore Board Canvas](#91-lore-board-canvas)
   - 9.2 [Node Management](#92-node-management)
   - 9.3 [Lore Generation Panel](#93-lore-generation-panel)
   - 9.4 [Avatar Generation](#94-avatar-generation)
   - 9.5 [Entity Extraction (NLP Import)](#95-entity-extraction-nlp-import)
   - 9.6 [Memory / History Panel](#96-memory--history-panel)
10. [Data Models](#10-data-models)
11. [UI / Design System](#11-ui--design-system)
12. [API Service Layer](#12-api-service-layer)
13. [Error Handling & Loading States](#13-error-handling--loading-states)
14. [Accessibility (a11y)](#14-accessibility-a11y)
15. [Testing Strategy](#15-testing-strategy)
16. [Environment & Configuration](#16-environment--configuration)
17. [Implementation Roadmap](#17-implementation-roadmap)

---

## 1. Project Overview

**Living Lore Board** is an AI-powered fantasy world-building tool that lets storytellers, game masters, and writers construct rich narrative universes interactively. Users build a visual knowledge graph of their world — characters, locations, organizations, and events — and the system automatically generates atmospheric lore describing the relationships between any two nodes using **Gemini 1.5 Flash** via LangChain. Portraits are generated with **FLUX.1-schnell** (Hugging Face) and entities can be bulk-imported from raw prose via **BERT NER**.

### Core User Journeys

| Journey | Description |
|---|---|
| **World Builder** | User creates nodes manually, draws connections, and generates lore for each edge |
| **Story Importer** | User pastes existing prose; BERT NER extracts entities as nodes automatically |
| **Portrait Artist** | User selects a character node and generates an AI portrait avatar |
| **Lore Keeper** | User reads previously generated lore and re-generates to evolve the world history |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                    │
│  ┌──────────────────────────────────────────────┐   │
│  │  LoreBoard Canvas  (React Flow / D3)         │   │
│  │  ├── NodeCard (character / location / etc.)  │   │
│  │  └── EdgeLine (lore relationship)            │   │
│  ├──────────────────────────────────────────────┤   │
│  │  Panels                                      │   │
│  │  ├── AddNodePanel                            │   │
│  │  ├── LorePanel (generate + view lore)        │   │
│  │  ├── AvatarPanel (generate AI portrait)      │   │
│  │  ├── ExtractPanel (paste text → NLP import)  │   │
│  │  └── HistoryPanel (lore memory log)          │   │
│  ├──────────────────────────────────────────────┤   │
│  │  API Service Layer  (fetch / axios)          │   │
│  └──────────────────────────────────────────────┘   │
└─────────────┬───────────────────────────────────────┘
              │  HTTP (REST JSON)
              ▼
┌─────────────────────────────────────────────────────┐
│            FastAPI Backend (port 8000)              │
│  POST /generate-lore    → Gemini 1.5 Flash          │
│  POST /generate-avatar  → FLUX.1-schnell (HF)       │
│  POST /extract-entities → BERT NER (HF)             │
│  GET  /health           → status check              │
└─────────────────────────────────────────────────────┘
```

The frontend is a **single-page application (SPA)** with no server-side rendering requirements. All state is maintained client-side (Zustand store) and optionally persisted to `localStorage` for session continuity.

---

## 3. Tech Stack & Dependencies

### Core

| Package | Version | Purpose |
|---|---|---|
| `react` | ^18.3.0 | UI framework |
| `react-dom` | ^18.3.0 | DOM rendering |
| `typescript` | ^5.4.0 | Type safety |
| `vite` | ^5.3.0 | Build tool & dev server (port 5173) |

### Graph / Canvas

| Package | Version | Purpose |
|---|---|---|
| `@xyflow/react` | ^12.x | Node-graph canvas (React Flow v12) |

> **Why React Flow?** It provides drag-and-drop nodes, custom edge rendering, minimap, controls, and a mature ecosystem — ideal for a lore knowledge graph with minimal boilerplate.

### State Management

| Package | Version | Purpose |
|---|---|---|
| `zustand` | ^4.5.0 | Lightweight global store |
| `immer` | ^10.x | Immutable state helpers (optional middleware) |

### UI & Styling

| Package | Version | Purpose |
|---|---|---|
| `tailwindcss` | ^3.4.0 | Utility-first CSS |
| `@headlessui/react` | ^2.x | Accessible modal, dialog, listbox primitives |
| `lucide-react` | ^0.400.0 | Icon set |
| `clsx` | ^2.x | Conditional class utility |

### HTTP

| Package | Version | Purpose |
|---|---|---|
| `axios` | ^1.7.0 | API calls with interceptors |

### Testing

| Package | Version | Purpose |
|---|---|---|
| `vitest` | ^1.x | Unit & integration test runner |
| `@testing-library/react` | ^16.x | Component testing |
| `msw` | ^2.x | API mock service worker |

### Dev Tooling

| Package | Version | Purpose |
|---|---|---|
| `eslint` | ^9.x | Linting |
| `prettier` | ^3.x | Code formatting |
| `@vitejs/plugin-react` | ^4.x | Vite React plugin |

---

## 4. Directory Structure

```
living-lore-board/
├── backend/                     # FastAPI (existing)
└── frontend/
    ├── public/
    │   └── favicon.svg
    ├── src/
    │   ├── api/
    │   │   ├── client.ts         # Axios instance, base URL, interceptors
    │   │   ├── lore.ts           # POST /generate-lore
    │   │   ├── avatar.ts         # POST /generate-avatar
    │   │   ├── entities.ts       # POST /extract-entities
    │   │   └── health.ts         # GET /health
    │   ├── components/
    │   │   ├── canvas/
    │   │   │   ├── LoreBoard.tsx         # Main React Flow canvas
    │   │   │   ├── NodeCard.tsx          # Custom node renderer
    │   │   │   ├── EdgeLore.tsx          # Custom edge with lore label
    │   │   │   └── CanvasControls.tsx    # Zoom/fit/clear toolbar
    │   │   ├── panels/
    │   │   │   ├── Sidebar.tsx           # Left sidebar shell
    │   │   │   ├── AddNodePanel.tsx      # Create new node form
    │   │   │   ├── LorePanel.tsx         # Generate/view lore for selection
    │   │   │   ├── AvatarPanel.tsx       # Generate character portrait
    │   │   │   ├── ExtractPanel.tsx      # NLP text import
    │   │   │   └── HistoryPanel.tsx      # Lore memory log
    │   │   ├── ui/
    │   │   │   ├── Button.tsx
    │   │   │   ├── Input.tsx
    │   │   │   ├── Textarea.tsx
    │   │   │   ├── Select.tsx
    │   │   │   ├── Badge.tsx
    │   │   │   ├── Spinner.tsx
    │   │   │   ├── Toast.tsx
    │   │   │   ├── Modal.tsx
    │   │   │   └── Tooltip.tsx
    │   │   └── layout/
    │   │       ├── AppShell.tsx          # Root layout wrapper
    │   │       ├── Header.tsx            # Top navigation bar
    │   │       └── StatusBar.tsx         # API health indicator
    │   ├── store/
    │   │   ├── boardStore.ts             # Nodes, edges, lore map
    │   │   ├── uiStore.ts                # Active panel, selection, modals
    │   │   └── historyStore.ts           # Generated lore history log
    │   ├── hooks/
    │   │   ├── useLoreGeneration.ts      # Wraps POST /generate-lore
    │   │   ├── useAvatarGeneration.ts    # Wraps POST /generate-avatar
    │   │   ├── useEntityExtraction.ts    # Wraps POST /extract-entities
    │   │   └── useApiHealth.ts           # Polls GET /health
    │   ├── types/
    │   │   └── index.ts                  # All shared TypeScript types
    │   ├── utils/
    │   │   ├── nodeHelpers.ts            # Node ID gen, position helpers
    │   │   └── loreHelpers.ts            # Edge key formatter, memory key
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css                     # Tailwind directives
    ├── index.html
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── package.json
```

---

## 5. API Contract

All endpoints are on `http://localhost:8000`. The Axios client is pre-configured with this base URL.

### `POST /generate-lore`

Generates 2–4 sentences of atmospheric lore describing the relationship between two world entities. Gemini 1.5 Flash uses a memory context from prior generations (Hindsight) for continuity.

**Request:**
```json
{
  "source": { "name": "Aelindra", "type": "character" },
  "target": { "name": "The Shattered Keep", "type": "location" }
}
```

**Response:**
```json
{
  "lore": "Aelindra first discovered the Shattered Keep during the Winter Siege..."
}
```

**Frontend trigger:** User selects two nodes and clicks **Generate Lore**. The response is rendered in the `LorePanel` and stored on the connecting edge.

---

### `POST /generate-avatar`

Generates a fantasy portrait for a character using FLUX.1-schnell. Returns a `data:image/jpeg;base64,...` URI — no external URL or file server needed.

**Request:**
```json
{ "name": "Aelindra" }
```

**Response:**
```json
{ "image_url": "data:image/jpeg;base64,/9j/4AAQ..." }
```

**Frontend trigger:** User clicks **Generate Avatar** on a character node card. The base64 data URI is stored in the node's `data.avatarUrl` and rendered as the node thumbnail.

> ⚠️ **Note:** FLUX.1-schnell can take 10–60 seconds on HF cold starts. A prominent loading skeleton with elapsed timer must be shown.

---

### `POST /extract-entities`

Runs BERT NER on pasted text. Returns deduplicated entities typed as `character`, `location`, `organization`, or `event`.

**Request:**
```json
{ "text": "Aelindra rode through the Shattered Keep..." }
```

**Response:**
```json
{
  "entities": [
    { "name": "Aelindra", "type": "character" },
    { "name": "Shattered Keep", "type": "location" }
  ]
}
```

**Frontend trigger:** User pastes story text in `ExtractPanel` and clicks **Extract & Import**. Returned entities are added as nodes on the canvas (deduplicating against existing node names).

---

### `GET /health`

```json
{ "status": "ok" }
```

Polled every 30 seconds from `useApiHealth`. Drives the `StatusBar` indicator (green = healthy, red = unreachable).

---

## 6. Pages & Routes

The application is a single-page app. React Router is **not required** — all navigation is panel-based within the main canvas view.

| View State | Trigger | Description |
|---|---|---|
| `board` | Default | Full canvas + sidebar |
| `onboarding` | First visit (no nodes) | Welcome overlay with quick-start guide |
| `error` | API unreachable | Degraded mode banner |

> There is no multi-page routing. The URL stays at `/` throughout the session.

---

## 7. Component Hierarchy

```
<AppShell>
  <Header />
  <StatusBar />                    ← API health dot
  <main>
    <Sidebar>
      <TabBar />                   ← Add / Lore / Avatar / Extract / History
      <AddNodePanel />             ← (tab: add)
      <LorePanel />                ← (tab: lore) shown when edge selected
      <AvatarPanel />              ← (tab: avatar) shown when char node selected
      <ExtractPanel />             ← (tab: extract)
      <HistoryPanel />             ← (tab: history)
    </Sidebar>

    <LoreBoard>                    ← React Flow Provider + Canvas
      <Background />               ← dot grid
      <MiniMap />
      <Controls />
      <CanvasControls />           ← custom toolbar (fit, clear, export)
      <NodeCard />                 ← (custom node type: "loreNode")
      <EdgeLore />                 ← (custom edge type: "loreEdge")
    </LoreBoard>
  </main>
</AppShell>
```

---

## 8. State Management

State is split across three Zustand stores to keep concerns separate.

### `boardStore`

Owns the graph data — the source of truth for the canvas.

```typescript
interface BoardStore {
  nodes: LoreNode[];
  edges: LoreEdge[];
  loreMap: Record<string, string>;          // edgeKey → lore text

  addNode: (node: LoreNode) => void;
  updateNode: (id: string, data: Partial<LoreNodeData>) => void;
  removeNode: (id: string) => void;

  addEdge: (edge: LoreEdge) => void;
  removeEdge: (id: string) => void;
  setLore: (edgeKey: string, lore: string) => void;

  onNodesChange: OnNodesChange;             // React Flow handler
  onEdgesChange: OnEdgesChange;             // React Flow handler
  onConnect: OnConnect;                     // React Flow handler
}
```

Persisted to `localStorage` under key `llb_board_v1` using `zustand/middleware/persist`.

### `uiStore`

Owns transient UI state — no persistence needed.

```typescript
interface UiStore {
  activeTab: 'add' | 'lore' | 'avatar' | 'extract' | 'history';
  selectedNodeIds: string[];
  selectedEdgeId: string | null;
  isGeneratingLore: boolean;
  isGeneratingAvatar: boolean;
  isExtractingEntities: boolean;
  toast: ToastMessage | null;

  setActiveTab: (tab: UiStore['activeTab']) => void;
  setSelection: (nodeIds: string[], edgeId: string | null) => void;
  setToast: (msg: ToastMessage | null) => void;
}
```

### `historyStore`

Owns the lore generation log for the History panel.

```typescript
interface HistoryEntry {
  id: string;
  timestamp: number;
  sourceNode: NodeRef;
  targetNode: NodeRef;
  lore: string;
}

interface HistoryStore {
  entries: HistoryEntry[];
  addEntry: (entry: HistoryEntry) => void;
  clearHistory: () => void;
}
```

Persisted to `localStorage` under key `llb_history_v1`.

---

## 9. Feature Specifications

### 9.1 Lore Board Canvas

**Component:** [`LoreBoard.tsx`](src/components/canvas/LoreBoard.tsx)

The central feature. Uses `@xyflow/react` to render a fully interactive node-graph.

#### Behaviour

- **Nodes** are draggable, selectable, and deletable (Delete/Backspace key).
- **Edges** are created by dragging from one node handle to another. An edge creation triggers an automatic lore generation prompt in the `LorePanel`.
- **Canvas background**: dot-grid pattern at 20px spacing.
- **MiniMap**: shows node type colours, positioned bottom-right.
- **Fit View**: on initial load and whenever nodes are programmatically added in bulk (entity extraction).
- **Snap to grid**: 20px grid snap enabled.
- **Node selection**: single click selects one node; Shift+click for multi-select (max 2 for lore generation).

#### Custom Node Type: `loreNode`

Defined in [`NodeCard.tsx`](src/components/canvas/NodeCard.tsx).

| Part | Description |
|---|---|
| **Icon badge** | Colour-coded icon per node type (see Design System §11) |
| **Avatar image** | `<img>` using base64 data URI if avatar has been generated; otherwise shows initials placeholder |
| **Node name** | Bold, truncated to 2 lines |
| **Type label** | Muted badge (e.g. "character") |
| **Delete button** | Appears on hover, top-right corner |
| **Connection handles** | React Flow default handles (top, bottom, left, right) |

#### Custom Edge Type: `loreEdge`

Defined in [`EdgeLore.tsx`](src/components/canvas/EdgeLore.tsx).

| Part | Description |
|---|---|
| **Path** | Bezier curve, 2px stroke |
| **Colour** | Default `#7c5cd8` (purple), dimmed when not selected |
| **Label** | First 60 chars of generated lore (shown on hover / edge selected) |
| **Generate button** | Small ✨ icon on the edge midpoint; clicking triggers lore generation |

---

### 9.2 Node Management

**Component:** [`AddNodePanel.tsx`](src/components/panels/AddNodePanel.tsx)

#### Add Node Form

| Field | Type | Validation |
|---|---|---|
| **Name** | Text input | Required, 1–80 chars, trimmed |
| **Type** | Select | Required: `character` \| `location` \| `organization` \| `event` |
| **Description** | Textarea | Optional, max 500 chars |

On submit:
1. Generates a `nanoid` node ID.
2. Positions new node at canvas centre + small random offset (to avoid exact overlap).
3. Dispatches `boardStore.addNode(...)`.
4. Switches `uiStore.activeTab` to `'lore'` if at least one other node exists.
5. Shows success toast: *"[Name] added to the board."*

---

### 9.3 Lore Generation Panel

**Component:** [`LorePanel.tsx`](src/components/panels/LorePanel.tsx)

Activated when:
- An **edge** is selected (shows the source and target node names).
- **Two nodes** are selected simultaneously (shows a "Connect & Generate" prompt).

#### Layout

```
┌─────────────────────────────────┐
│  ✨ Generate Lore               │
├─────────────────────────────────┤
│  Source:  [Aelindra] (character)│
│  Target:  [Shattered Keep] (loc)│
├─────────────────────────────────┤
│  [Generate Lore]  ← button      │
├─────────────────────────────────┤
│  ─── Generated Lore ───         │
│                                 │
│  "Aelindra first discovered..." │
│                                 │
│  [Regenerate]  [Copy]           │
└─────────────────────────────────┘
```

#### Behaviour

- **Generate Lore** calls `POST /generate-lore` with source and target `NodeRef`.
- While loading: button is disabled, shows `<Spinner />`, lore area shows a 3-line skeleton.
- On success: lore is stored in `boardStore.loreMap[edgeKey]` and displayed.
- **Regenerate** re-calls the API (memory context on the backend evolves, so the new lore will reference prior lore).
- **Copy** copies lore text to clipboard, shows brief "Copied!" toast.
- If no edge is selected and only 1 or 0 nodes selected, shows an instructional empty state: *"Select two nodes or an edge to generate lore."*

---

### 9.4 Avatar Generation

**Component:** [`AvatarPanel.tsx`](src/components/panels/AvatarPanel.tsx)

Activated when exactly **one node of type `character`** is selected.

#### Layout

```
┌─────────────────────────────────┐
│  🎨 Character Portrait          │
├─────────────────────────────────┤
│  Character: Aelindra            │
├─────────────────────────────────┤
│  [Generate Portrait]  ← button  │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │  [ 256×256 avatar image ] │  │
│  └───────────────────────────┘  │
│  ⏱ Generation may take ~30s    │
│  [Download]                     │
└─────────────────────────────────┘
```

#### Behaviour

- **Generate Portrait** calls `POST /generate-avatar` with `{ name: selectedNode.data.name }`.
- Shows a pulsing skeleton placeholder + elapsed timer ("Generating… 12s") during the request.
- On success: stores `image_url` (base64 data URI) in `boardStore` node data → node card thumbnail updates.
- **Download** creates an `<a download>` with the base64 URI.
- If selected node is not a `character`, shows: *"Portrait generation is only available for character nodes."*

---

### 9.5 Entity Extraction (NLP Import)

**Component:** [`ExtractPanel.tsx`](src/components/panels/ExtractPanel.tsx)

Allows users to paste any prose and automatically populate the board with entities extracted by BERT NER.

#### Layout

```
┌─────────────────────────────────┐
│  📖 Import from Story Text      │
├─────────────────────────────────┤
│  Paste your story text:         │
│  ┌───────────────────────────┐  │
│  │  <textarea rows=6 />      │  │
│  └───────────────────────────┘  │
│  (max 512 characters — BERT)    │
│  [Extract & Import]  ← button   │
├─────────────────────────────────┤
│  Found 4 entities:              │
│  ● Aelindra    [character]  ✓   │
│  ● Shattered Keep [location] ✓  │
│  ● Order of Ash  [org]      ✓   │
│  ● Winter Siege  [event]    ✓   │
│                                 │
│  [Add Selected to Board]        │
└─────────────────────────────────┘
```

#### Behaviour

1. Calls `POST /extract-entities` with the pasted text (client trims to 512 chars with a counter).
2. Results are shown as a checklist — all checked by default.
3. Entities that **already exist** on the board (case-insensitive name match) are shown with a "Already on board" chip and unchecked.
4. **Add Selected to Board** adds checked entities as new nodes, fit-view is called after bulk add.
5. Shows success toast: *"3 entities added to the board."*

---

### 9.6 Memory / History Panel

**Component:** [`HistoryPanel.tsx`](src/components/panels/HistoryPanel.tsx)

Displays a chronological log of all lore generation calls in this session.

#### Layout

```
┌─────────────────────────────────┐
│  📜 Lore History    [Clear All] │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ Aelindra ↔ Shattered Keep │  │
│  │ "Aelindra first discovered│  │
│  │  the Shattered Keep..."   │  │
│  │ [12:43 PM]       [Copy]   │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ ...                       │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

#### Behaviour

- Each entry shows: source node name, target node name, lore text (truncated to 3 lines, expand on click), and timestamp.
- **Clear All** clears `historyStore` and shows confirmation modal.
- Entries are persisted to `localStorage`.

---

## 10. Data Models

Defined in [`src/types/index.ts`](src/types/index.ts).

```typescript
// ── Node types ──────────────────────────────────────────────

export type NodeType = 'character' | 'location' | 'organization' | 'event';

export interface LoreNodeData {
  name: string;
  type: NodeType;
  description?: string;
  avatarUrl?: string;          // base64 data URI from /generate-avatar
}

export interface LoreNode extends Node<LoreNodeData> {
  type: 'loreNode';
}

// ── Edge types ──────────────────────────────────────────────

export interface LoreEdgeData {
  lore?: string;               // generated lore text for this relationship
}

export interface LoreEdge extends Edge<LoreEdgeData> {
  type: 'loreEdge';
}

// ── API types ───────────────────────────────────────────────

export interface NodeRef {
  name: string;
  type: NodeType;
}

export interface LoreRequest {
  source: NodeRef;
  target: NodeRef;
}

export interface LoreResponse {
  lore: string;
}

export interface AvatarRequest {
  name: string;
}

export interface AvatarResponse {
  image_url: string;
}

export interface ExtractRequest {
  text: string;
}

export interface EntityItem {
  name: string;
  type: NodeType;
}

export interface ExtractResponse {
  entities: EntityItem[];
}

// ── UI types ─────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;           // ms, default 3000
}

// ── History ──────────────────────────────────────────────────

export interface HistoryEntry {
  id: string;
  timestamp: number;
  sourceNode: NodeRef;
  targetNode: NodeRef;
  lore: string;
}
```

---

## 11. UI / Design System

### Colour Palette

| Token | Hex | Usage |
|---|---|---|
| `bg-canvas` | `#0f0f13` | Canvas background (dark) |
| `bg-surface` | `#1a1a24` | Sidebar, node cards |
| `bg-elevated` | `#242433` | Modals, dropdowns |
| `border` | `#2e2e40` | Dividers, card borders |
| `text-primary` | `#e8e8f0` | Main text |
| `text-muted` | `#8888a8` | Labels, timestamps |
| `accent-purple` | `#7c5cd8` | Edges, primary actions |
| `accent-blue` | `#3b82f6` | Secondary actions, links |
| `success` | `#22c55e` | API healthy, success toast |
| `error` | `#ef4444` | Errors, API down |
| `warning` | `#f59e0b` | Rate limit warning |

> The application uses a **dark fantasy aesthetic** — dark backgrounds, muted text, with purple/violet accents to evoke a magical world-building tool.

### Node Type Colours

| Type | Colour | Tailwind Token |
|---|---|---|
| `character` | Amber `#f59e0b` | `text-amber-400` |
| `location` | Emerald `#10b981` | `text-emerald-400` |
| `organization` | Blue `#3b82f6` | `text-blue-400` |
| `event` | Rose `#f43f5e` | `text-rose-400` |

These colours are applied to: node card border-left accent, badge background, MiniMap node colour.

### Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| App title | System sans-serif | 18px | 700 |
| Panel heading | System sans-serif | 14px | 600 |
| Node name | System sans-serif | 13px | 600 |
| Body / lore text | Georgia / serif | 14px | 400 |
| Label / badge | System sans-serif | 11px | 500 |
| Timestamp | Monospace | 11px | 400 |

> Lore text specifically uses a **serif font** to reinforce the "ancient scroll" aesthetic for fantasy narrative content.

### Spacing & Layout

- Sidebar width: `320px` fixed, collapsible to `48px` icon rail.
- Canvas: fills remaining viewport width and full height.
- Panel inner padding: `16px`.
- Node card: `160px × auto`, min-height `80px`, border-radius `8px`.
- Button border-radius: `6px`.
- Input border-radius: `6px`.

### Component Variants

#### `<Button />`

```typescript
variant: 'primary' | 'secondary' | 'ghost' | 'danger'
size: 'sm' | 'md' | 'lg'
loading?: boolean       // shows spinner, disables
disabled?: boolean
```

#### `<Badge />`

```typescript
variant: NodeType | 'default'
// renders colour-coded pill matching node type colour
```

#### `<Spinner />`

- Sizes: `sm` (16px), `md` (24px), `lg` (40px).
- Colour inherits from parent text colour.

#### `<Toast />`

- Positioned: bottom-right, stacks upward.
- Auto-dismisses after 3s (configurable).
- Icon: ✓ success, ✗ error, ℹ info.

---

## 12. API Service Layer

Defined in [`src/api/client.ts`](src/api/client.ts).

```typescript
// src/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  timeout: 90_000,    // 90s — accommodates FLUX cold start (up to 60s)
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor — normalise error shape
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.detail ?? err.message ?? 'Unknown error';
    return Promise.reject(new Error(message));
  },
);
```

Each API module exports a single typed async function:

```typescript
// src/api/lore.ts
export async function generateLore(req: LoreRequest): Promise<LoreResponse> {
  const { data } = await apiClient.post<LoreResponse>('/generate-lore', req);
  return data;
}

// src/api/avatar.ts
export async function generateAvatar(req: AvatarRequest): Promise<AvatarResponse> {
  const { data } = await apiClient.post<AvatarResponse>('/generate-avatar', req);
  return data;
}

// src/api/entities.ts
export async function extractEntities(req: ExtractRequest): Promise<ExtractResponse> {
  const { data } = await apiClient.post<ExtractResponse>('/extract-entities', req);
  return data;
}

// src/api/health.ts
export async function checkHealth(): Promise<boolean> {
  try {
    await apiClient.get('/health');
    return true;
  } catch {
    return false;
  }
}
```

---

## 13. Error Handling & Loading States

### Loading States

Every async operation must be tracked explicitly to prevent UI deadlock:

| Operation | Loading indicator | Duration hint |
|---|---|---|
| Generate Lore | Button spinner + 3-line skeleton in LorePanel | ~2–5s |
| Generate Avatar | Full panel skeleton + elapsed timer | ~10–60s |
| Extract Entities | Button spinner + "Analysing…" text | ~3–8s |
| API Health Poll | StatusBar dot blinks while checking | ~0.5s |

### Error Handling

| Error Scenario | UI Response |
|---|---|
| Network unreachable | Error toast: "Cannot connect to server." + StatusBar turns red |
| 422 Validation error | Toast with detail message from FastAPI |
| Session limit (50 calls) | Error toast: "Session limit reached. Please refresh." |
| FLUX model loading (503) | Toast: "Image model warming up — please retry in 30 seconds." |
| BERT model error | Toast: "Entity extraction failed. Please try again." |
| Avatar on non-character | Panel info message (not an error toast) |

### Retry Logic

Avatar generation (`/generate-avatar`) should include a **manual retry** button since HF cold starts may return 503. No automatic retry — user intent is required.

---

## 14. Accessibility (a11y)

- All interactive elements have visible focus rings (Tailwind `focus-visible:ring-2`).
- Buttons use native `<button>` elements with descriptive `aria-label` where text is absent (icon-only buttons).
- Toast messages are announced via `role="status"` / `aria-live="polite"`.
- Modal dialogs trap focus using `@headlessui/react` Dialog.
- Canvas (React Flow) is keyboard-navigable for node selection via arrow keys.
- Colour is never the sole differentiator — node types also show text labels and distinct icons.
- All images (`<img>`) have meaningful `alt` text: `alt="${node.data.name} portrait"`.

---

## 15. Testing Strategy

### Unit Tests (`vitest`)

- `nodeHelpers.ts` — ID generation, position offset logic.
- `loreHelpers.ts` — Edge key formatting (`name_a::name_b`).
- `boardStore.ts` — Node/edge CRUD, loreMap updates.
- `historyStore.ts` — Entry persistence and clearing.

### Component Tests (`@testing-library/react`)

| Component | What to test |
|---|---|
| `AddNodePanel` | Form validation, store dispatch on submit |
| `LorePanel` | Renders lore, calls API, shows spinner |
| `ExtractPanel` | Textarea input, checklist display, add to board |
| `NodeCard` | Renders name, type badge, avatar image |

### API Mock (`msw`)

Define handlers for all three endpoints in `src/mocks/handlers.ts`:

```typescript
// mocked successful lore response
http.post('/generate-lore', () =>
  HttpResponse.json({ lore: 'Mock lore text for testing.' })
),
```

Use `server.use(...)` for per-test overrides (e.g. 503 error scenarios).

### Integration Tests

- End-to-end flow: add two nodes → connect → generate lore → lore appears on edge.
- Extract entities → entities appear on board.

---

## 16. Environment & Configuration

```bash
# frontend/.env.local
VITE_API_BASE_URL=http://localhost:8000
```

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | FastAPI backend URL |

> `VITE_` prefix is required for Vite to expose env vars to the browser bundle.

### `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Optional: proxy API calls to avoid CORS in dev
      '/api': {
        target: 'http://localhost:8000',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

---

## 17. Implementation Roadmap

### Phase 1 — Scaffold & Core Canvas (Days 1–2)

- [ ] Initialise Vite + React + TypeScript project
- [ ] Install and configure Tailwind CSS
- [ ] Set up `@xyflow/react` with empty canvas
- [ ] Implement `AppShell`, `Header`, `Sidebar` layout
- [ ] Implement `boardStore` with Zustand + localStorage persistence
- [ ] Implement `LoreNode` custom node type with NodeCard
- [ ] Implement `LoreEdge` custom edge type

### Phase 2 — Add Node & Connect (Day 3)

- [ ] Build `AddNodePanel` form with validation
- [ ] Implement drag-to-connect edge creation
- [ ] Wire `onConnect` → `boardStore.addEdge`
- [ ] Auto-switch to LorePanel tab on new edge creation
- [ ] Implement `CanvasControls` (fit, clear, snap)

### Phase 3 — Lore Generation (Day 4)

- [ ] Build API client (`client.ts`, `lore.ts`)
- [ ] Implement `useLoreGeneration` hook
- [ ] Build `LorePanel` with loading skeleton and lore display
- [ ] Store lore in `boardStore.loreMap` and display on edge label
- [ ] Implement `historyStore` and `HistoryPanel`

### Phase 4 — Avatar & Entity Extraction (Day 5)

- [ ] Build `avatar.ts` API function
- [ ] Implement `useAvatarGeneration` hook with elapsed timer
- [ ] Build `AvatarPanel` with skeleton loader and download button
- [ ] Build `entities.ts` API function
- [ ] Implement `useEntityExtraction` hook
- [ ] Build `ExtractPanel` with checklist and bulk import

### Phase 5 — Polish & Reliability (Day 6)

- [ ] Implement `Toast` notification system
- [ ] Implement `StatusBar` with `useApiHealth` polling
- [ ] Add onboarding empty-state overlay
- [ ] Full error handling for all API failure scenarios
- [ ] Accessibility audit (keyboard nav, aria labels, focus rings)
- [ ] Write unit and component tests
- [ ] Configure MSW for testing

### Phase 6 — Final QA (Day 7)

- [ ] Cross-browser test (Chrome, Firefox, Safari)
- [ ] Test with real backend (all three ML endpoints)
- [ ] Performance check: large graph (50+ nodes)
- [ ] Verify `localStorage` persistence across page reloads
- [ ] Review and tighten TypeScript types (no `any`)

---

## Appendix A — Edge Key Format

Edges connecting two nodes are keyed in `boardStore.loreMap` using the same format as the backend memory manager:

```
`${sourceName.toLowerCase()}::${targetName.toLowerCase()}`
```

This ensures frontend lore storage and backend memory retrieval remain aligned.

---

## Appendix B — Node Type Icon Map

| Type | Lucide Icon | Colour class |
|---|---|---|
| `character` | `User` | `text-amber-400` |
| `location` | `MapPin` | `text-emerald-400` |
| `organization` | `Shield` | `text-blue-400` |
| `event` | `Zap` | `text-rose-400` |

---

## Appendix C — Session Limit Behaviour

The backend enforces a hard limit of **50 LLM calls per session** (via CascadeFlow / fallback tracker). The frontend must:

1. Count successful `/generate-lore` calls in session storage.
2. When count reaches **45**, show a soft warning: *"Approaching session limit (5 calls remaining)."*
3. When a 500/RuntimeError is returned with the session limit message, show a non-dismissible banner: *"Session limit reached. Refresh the page to start a new session."*
4. Disable the **Generate Lore** button while the banner is active.

---

*Document maintained by the Living Lore Board frontend team. Update this document before merging any feature that changes the API contract or component structure.*
