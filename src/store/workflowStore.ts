import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuid } from 'uuid';
import type { NodeInstance, NodeType, EdgeInstance } from '../types';

interface WorkflowState {
  nodeTypes: NodeType[];
  typeHierarchy: Record<string, string | null>;
  nodes: Record<string, NodeInstance>;
  edges: EdgeInstance[];
  selected: string[];
  editing: string | null;
  contextMenu: {
    type: 'node' | 'edge';
    id: string;
    position: { x: number; y: number };
  } | null;
  theme: 'light' | 'dark';
  undoStack: unknown[];
  redoStack: unknown[];
  lastError: string | null;
  setError: (msg: string) => void;

  loadDefinitions: (json: {
    types: Record<string, string | null>;
    nodes: NodeType[];
  }) => void;
  addNode: (typeId: string, position: { x: number; y: number }) => void;
  duplicateNode: (uuid: string) => void;
  removeNode: (uuid: string) => void;
  addEdge: (edge: EdgeInstance) => void;
  removeEdge: (id: string) => void;
  openContextMenu: (
    menu: { type: 'node' | 'edge'; id: string; position: { x: number; y: number } } | null
  ) => void;
  setTheme: (t: 'light' | 'dark') => void;
  setSelected: (ids: string[]) => void;
  openEditor: (id: string) => void;
  closeEditor: () => void;
  updateNodeField: (uuid: string, fieldId: string, value: unknown) => void;
  moveNode: (uuid: string, pos: { x: number; y: number }) => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  immer((set) => ({
    lastError: null,
    nodeTypes: [],
    typeHierarchy: {},
    nodes: {},
    edges: [],
    selected: [],
    editing: null,
    contextMenu: null,
    theme:
      (localStorage.getItem('theme') as 'light' | 'dark') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'),
    undoStack: [],
    redoStack: [],

    setError: (msg) =>
      set((s) => {
        s.lastError = msg;
        /* auto-clear after 3 s */
        setTimeout(() => set((st) => void (st.lastError = null)), 3000);
      }),

    loadDefinitions: (json) =>
      set((s) => {
        console.log('loadDefinitions', json);
        s.nodeTypes = json.nodes;
        s.typeHierarchy = json.types;
      }),

    addNode: (typeId, position) =>
      set((s) => {
        console.log('addNode', typeId, position);
        const id = uuid();
        s.nodes[id] = {
          uuid: id,
          nodeTypeId: typeId,
          position,
          fields: {}
        };
      }),

    duplicateNode: (origId) =>
      set((s) => {
        console.log('duplicateNode', origId);
        const orig = s.nodes[origId];
        if (!orig) return;
        const id = uuid();
        s.nodes[id] = {
          uuid: id,
          nodeTypeId: orig.nodeTypeId,
          position: { x: orig.position.x + 20, y: orig.position.y + 20 },
          fields: { ...orig.fields }
        };
      }),

    removeNode: (id) =>
      set((s) => {
        console.log('removeNode', id);
        delete s.nodes[id];
        s.edges = s.edges.filter(
          (e) => e.from.uuid !== id && e.to.uuid !== id
        );
      }),

    addEdge: (edge) =>
      set((s) => {
        console.log('addEdge', edge);
        s.edges.push(edge);
      }),

    removeEdge: (id) =>
      set((s) => {
        console.log('removeEdge', id);
        s.edges = s.edges.filter((e) => e.id !== id);
      }),

    openContextMenu: (menu) =>
      set((s) => {
        console.log('openContextMenu', menu);
        s.contextMenu = menu;
      }),

    setTheme: (t) =>
      set((s) => {
        s.theme = t;
        localStorage.setItem('theme', t);
      }),

    setSelected: (ids) =>
      set((s) => {
        s.selected = ids;
      }),

    openEditor: (id) =>
      set((s) => {
        s.editing = id;
      }),

    closeEditor: () =>
      set((s) => {
        s.editing = null;
      }),

    updateNodeField: (uuid, fieldId, value) =>
      set((s) => {
        if (s.nodes[uuid]) {
          s.nodes[uuid].fields[fieldId] = value;
        }
      }),

    moveNode: (uuid, pos) =>
      set((s) => {
        if (s.nodes[uuid]) {
          s.nodes[uuid].position = pos;
        }
      })
  }))
);
