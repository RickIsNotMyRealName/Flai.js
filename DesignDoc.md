# Visual Node Editor – **Client-Side Design Document**

_Version 0.2 – June 7 2025 (adds single-element-per-row node layout)_

---

## Table of Contents

- [Visual Node Editor – **Client-Side Design Document**](#visual-node-editor--client-side-design-document)
  - [Table of Contents](#table-of-contents)
  - [Purpose \& Scope](#purpose--scope)
  - [Glossary](#glossary)
  - [User Stories](#user-stories)
  - [Functional Requirements](#functional-requirements)
    - [4.1 Node Definition \& Loading](#41-node-definition--loading)
    - [4.2 Palette \& Search](#42-palette--search)
    - [4.3 Canvas \& Node Interaction](#43-canvas--node-interaction)
      - [4.3.1 Canvas](#431-canvas)
      - [4.3.2 Connections](#432-connections)
      - [4.3.3 Node Layout **(new)**](#433-node-layout-new)
      - [4.3.4 Context Menu](#434-context-menu)
    - [4.4 Data-Entry \& Validation](#44-data-entry--validation)
    - [4.5 Serialization \& Export](#45-serialization--export)
    - [4.6 Theming](#46-theming)
  - [Non-Functional Requirements](#non-functional-requirements)
  - [Technical Architecture](#technical-architecture)
    - [6.1 Proposed Tech Stack](#61-proposed-tech-stack)
    - [6.2 High-Level Component Map](#62-high-level-component-map)
    - [6.3 State Model \& UUID Strategy](#63-state-model--uuid-strategy)
  - [Data Schemas](#data-schemas)
    - [7.1 `NodeType` JSON Schema (excerpt)](#71-nodetype-json-schema-excerpt)
    - [7.2 `Workflow` JSON Schema (simplified)](#72-workflow-json-schema-simplified)
  - [Error Handling \& Validation Rules](#error-handling--validation-rules)
  - [Accessibility \& i18n](#accessibility--i18n)
  - [Testing Strategy](#testing-strategy)
    

---

## Purpose & Scope

This document specifies the **client-side** design for a _visual node editor_ that lets users compose AI-agent workflows by dragging node types onto a canvas and wiring them together.  
Server concerns (authentication, storage, execution, collaboration) are **out of scope** for this phase.

## Glossary

|Term|Meaning|
|---|---|
|**Node**|UI block representing a discrete operation (e.g., “OpenAI LLM”, “Fetch URL”).|
|**Pin / Port**|Connection point on a node. Has a _direction_ (`input`/`output`), a _type_, and _cardinality_ rules.|
|**Node Type**|JSON-defined template describing pins, config fields, icons, defaults, etc.|
|**Palette**|Sidebar listing available node types, searchable by name/tag.|
|**Canvas**|Main editing surface for placing nodes and drawing connections.|
|**Workflow JSON**|Serializable representation of the graph, suitable for storage or execution.|

## User Stories

1. **Search & Add** – As a user, I can search for node types and drag them to the canvas.
    
2. **Connect** – I can draw connections only between compatible pin types.
    
3. **Configure** – I can fill in required and optional fields for each node via a property panel.
    
4. **Validate** – The editor tells me if required pins/fields are missing or cardinality limits are exceeded.
    
5. **Theme** – I can switch between light and dark mode.
    
6. **Persist** – I can export the workflow to JSON or send it to the server via an API call.
    
7. **Undo / Redo** – I can undo or redo edits. _(Stretch Goal)_
    

---

## Functional Requirements

### 4.1 Node Definition & Loading

- Accept a **JSON file/URL** describing an array of `NodeType` objects.
    
- Hot-reload on file change or URL refetch (debounced).
    
- Fail gracefully with schema validation errors.
    

### 4.2 Palette & Search

- Collapsible, resizable sidebar.
    
- Fuzzy search by name, tag, or description.
    
- Drag-and-drop instantiation onto canvas, assigning a **UUIDv4** at spawn time.
    

### 4.3 Canvas & Node Interaction

#### 4.3.1 Canvas

- Pan & zoom (trackpad / mouse wheel).
    
- Snap-to-grid (optional toggle).
    

#### 4.3.2 Connections

- Begin drag from output → highlight compatible inputs.
    
- Enforce _type hierarchy_ compatibility: `DerivedType ≤ BaseType` ⇒ allowed.
    
- Cardinality:
    
    - `one` (max 1)
        
    - `many` (∞)
        
    - `exactN` (constant)
        

#### 4.3.3 Node Layout **(new)**

- **Single-Element-Per-Row Rule** – Each visual row inside a node must contain exactly **one** of the following:
    
    - Title bar (may include icon)
        
    - Individual pin (input or output)
        
    - Button or action control
        
    - Inline field (if displayed directly on node)
        
- Rationale: guarantees consistent spacing, predictable hit-testing, and simpler keyboard navigation.
    

#### 4.3.4 Context Menu

- Delete node / connection
    
- Duplicate node
    
- Auto-layout _(stretch goal)_
    

### 4.4 Data-Entry & Validation

- Selecting a node opens a **Properties Panel** (modal or side drawer).
    
- Fields follow JSON-schema types (`string`, `number`, `enum`, `boolean`, `object`).
    
- Default values pre-populated from `NodeType.defaults`.
    
- Real-time validation summary (✓/✗ icon on node).
    

### 4.5 Serialization & Export

- `Export` button:
    
    - Download `.workflow.json` _OR_ POST to a server endpoint.
        
- Export must include:
    
    - Nodes (UUIDs, `nodeTypeId`, position, field values)
        
    - Connections (sourceUUID/pin → targetUUID/pin)
        

### 4.6 Theming

- Two built-in themes: **Light** & **Dark**.
    
- Theme stored in `localStorage` and reacts to OS `prefers-color-scheme`.
    
- All colors exposed via CSS variables for future theming.
    

---

## Non-Functional Requirements

|Aspect|Requirement|
|---|---|
|**Performance**|60 fps interactions with ≥ 1 000 nodes on modern hardware.|
|**Bundle Size**|≤ 2 MB (gzipped) initial load; node-types payload fetched lazily.|
|**Browser Support**|Evergreen browsers (Chrome > 120, Firefox > 115, Safari > 17, Edge > 120).|
|**Security**|API keys entered in nodes **never** leave the browser unless the user exports or explicitly submits.|
|**Extensibility**|Plugin API for custom renderers and pin types.|
|**Offline**|Works fully offline once assets are cached (Service Worker / PWA).|

---

## Technical Architecture

### 6.1 Proposed Tech Stack

|Layer|Tech|Rationale|
|---|---|---|
|UI Framework|**React 18 + TypeScript**|Ecosystem, dev-experience, typing.|
|Canvas|**react-flow** or **@xyflow/reactflow**|Handles pan/zoom, edges, performance.|
|State|**Zustand**|Lightweight, undo/redo via middleware.|
|Styling|**CSS Modules** with custom properties; optional **Tailwind**.||
|UUID|**uuid** npm package (v4).||
|Build Tool|**Vite**|Fast dev server & HMR.|
|Testing|**Vitest** + **React Testing Library**; **Playwright** for e2e.||


### 6.2 High-Level Component Map

```
App
├─ ThemeProvider
├─ NodePalette
├─ EditorCanvas
│   ├─ FlowRenderer (react-flow)
│   ├─ CustomNodeRenderer   <- enforces single-row rule
│   └─ ConnectionValidator
└─ PropertiesPanel
```

### 6.3 State Model & UUID Strategy

```ts
interface WorkflowState {
  nodes: Record<UUID, NodeInstance>;
  edges: EdgeInstance[];
  selected: UUID[];
  palette: NodeType[];
  theme: 'light' | 'dark';
  undoStack: Patch[];
  redoStack: Patch[];
}
```

_Every_ entity gets a **UUIDv4** on creation, enabling deterministic diff/patch and conflict-free merging later.

---

## Data Schemas

### 7.1 `NodeType` JSON Schema (excerpt)

```jsonc
{
  "$id": "https://example.com/schemas/nodeType.json",
  "type": "object",
  "required": ["id", "name", "inputs", "outputs"],
  "properties": {
    "id":    { "type": "string" },
    "name":  { "type": "string" },
    "icon":  { "type": "string", "format": "uri" },
    "tags":  { "type": "array", "items": { "type": "string" } },
    "layout": { "enum": ["singleRow"] },          // enforce rule
    "inputs": { "type": "array", "items": { "$ref": "#/$defs/pin" } },
    "outputs": { "type": "array", "items": { "$ref": "#/$defs/pin" } },
    "fields": { "type": "array", "items": { "$ref": "#/$defs/field" } }
  },
  ...
}
```

### 7.2 `Workflow` JSON Schema (simplified)

```jsonc
{
  "nodes": [
    {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "nodeTypeId": "openai.chat",
      "position": { "x": 200, "y": 120 },
      "fields": { "apiKey": "sk-..." }
    }
  ],
  "edges": [
    {
      "from": { "uuid": "550e8400...", "pin": "chatOut" },
      "to":   { "uuid": "99b9f...",  "pin": "analysisIn" }
    }
  ],
  "meta": { "version": "0.2.0", "created": "2025-06-07T18:20:00Z" }
}
```

---

## Error Handling & Validation Rules

|Scenario|UX Outcome|
|---|---|
|Connect incompatible pin types|Red edge + tooltip “Type mismatch (Text → Number)”.|
|Required pin unconnected|Warning icon on node; workflow export blocked until resolved.|
|Node violates single-row rule (dev error)|Dev console error + node rendered with dashed border.|
|Field validation failure|Property panel highlights invalid field; node border turns orange.|
|JSON-load fails schema|Modal with error list; palette remains empty.|

---

## Accessibility & i18n

- **WCAG 2.1 AA** compliance (aria-labels, contrast, keyboard navigation).
    
- Text extracted to `i18n` bundles (`json`) for future language packs.
    
- Canvas keyboard shortcuts exposed via help dialog.
    

---

## Testing Strategy

|Layer|Tool|Coverage Goal|
|---|---|---|
|Unit / Func|Vitest|90 % critical modules|
|Component|React Testing Library|Interactions & single-row renderer|
|e2e|Playwright|Core flows (add → connect → validate → export)|
|Performance|Lighthouse CI|95+ perf score|