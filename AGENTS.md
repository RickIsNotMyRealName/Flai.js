# Repo Guide for Flai.js Client

This project implements a visual node editor for building AI workflows. The architecture and behaviour are captured in `DesignDoc.md`; refer to it whenever adding new features.

## Project Structure

```
.
├─ public/            # Static assets served as-is
│   └─ nodeTypes.json # Node type definitions (see below)
├─ src/               # React + TypeScript source
│   ├─ components/    # UI components (canvas, palette, workflow manager, etc.)
│   ├─ store/         # Zustand state store with localStorage persistence
│   ├─ logic/         # Business logic helpers & validation
│   │   └─ __tests__/ # Vitest unit tests
│   ├─ index.css      # Base styles
│   ├─ theme.css      # Light/Dark themes via CSS variables
│   └─ types.ts       # Shared TypeScript interfaces
├─ index.html         # Vite entry page
├─ vite.config.ts     # Vite configuration
└─ DesignDoc.md       # Detailed design document
```

### Key Components
- **App.tsx** – Root component that fetches node definitions and renders the workflow manager, palette, canvas, properties panel and error toast.
- **components/**
  - `WorkflowManager.tsx` – Dropdown + modals to save/load/delete workflows (autosave).
  - `NodePalette.tsx` – Sidebar of node types with search, drag-and-drop and a validate button.
  - `EditorCanvas.tsx` – Wraps the React Flow canvas and synchronises with the store.
  - `CustomNode.tsx` – Renders nodes using the single-row layout and exposes an edit button.
  - `PropertiesPanel.tsx` – Modal editor for the selected node's fields.
  - `ErrorToast.tsx` – Transient error display.
- **store/workflowStore.ts** – Zustand store implementing the workflow state model and localStorage persistence.
- **logic/pinValidation.ts** – Implements connection and workflow validation (tested).

### Node Definitions
Node types are **entirely described in `public/nodeTypes.json`**. The editor does not hard-code names, pins or fields; every attribute comes from this JSON file:
- `name`, `icon` and `tags`
- `inputs` and `outputs` pins with their type and cardinality (e.g. `one`, `many` or `{ exact: n }`)
- `fields` with labels, data types and whether they are required
- optional defaults and any custom data

Adding or modifying a node only requires editing this JSON—no code changes are needed. The store loads the file at startup and the rest of the UI references these definitions.

Recent updates added additional node types (start/end nodes, embeddings and extra tools).

### Architecture Overview
- **React 18 + TypeScript** – UI framework
- **@xyflow/react** – Canvas / edges rendering
- **Zustand** – Centralised state management with `immer` middleware
- **Vite** – Build tool and dev server
- **UUID** – `uuid` package used for deterministic IDs
- **Vitest** – Unit test runner

The high-level component map mirrors `DesignDoc.md`:

```
App
├─ WorkflowManager
├─ NodePalette
├─ EditorCanvas
│   └─ CustomNode (via ReactFlow)
└─ PropertiesPanel
```

### Data Flow
1. `App.tsx` loads `nodeTypes.json` and populates the store with `NodeType` objects and the type hierarchy.
2. Dragging from the palette spawns nodes on the canvas with new UUIDs.
3. Connections are created via React Flow and validated by `logic/pinValidation.ts`.
4. Selecting a node opens its fields in `PropertiesPanel` for editing.
5. Workflows auto-save to `localStorage`; `WorkflowManager` lets users save, load and delete named flows.
6. Theme preference is persisted in `localStorage`.

### Notes for Contributors
- Follow the design intent in `DesignDoc.md` when adding features or refactoring.
- Run `npm run verify` before committing changes to compile, type-check and run the tests.
- The repo currently uses plain CSS; switch to CSS Modules or Tailwind only if consistent with the design doc.
- If the project structure or workflow changes, **update this `AGENTS.md`** to keep it current.
- When submitting a PR with significant changes, add, modify or remove sections of this file so it accurately reflects the new state of the project.
