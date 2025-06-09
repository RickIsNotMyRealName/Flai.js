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
  workflowName: string;
  dirty: boolean;
  savedWorkflows: string[];
  toast: { message: string; type: 'error' | 'success' } | null;
  setToast: (msg: string, type?: 'error' | 'success') => void;
  refreshSavedWorkflows: () => void;
  saveWorkflow: (name: string) => void;
  loadWorkflow: (name: string) => void;

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
    toast: null,
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
    workflowName: 'autosave',
    dirty: false,
    savedWorkflows: [],

    setToast: (msg, type = 'error') =>
      set((s) => {
        s.toast = { message: msg, type };
        /* auto-clear after 3 s */
        setTimeout(() => set((st) => void (st.toast = null)), 3000);
      }),

    refreshSavedWorkflows: () =>
      set((s) => {
        const list = localStorage.getItem('workflows');
        s.savedWorkflows = list ? JSON.parse(list) : [];
      }),

    saveWorkflow: (name) =>
      set((s) => {
        localStorage.setItem(
          `workflow.${name}`,
          JSON.stringify({ nodes: s.nodes, edges: s.edges })
        );
        const list = localStorage.getItem('workflows');
        const names = list ? JSON.parse(list) : [];
        if (!names.includes(name)) {
          names.push(name);
          localStorage.setItem('workflows', JSON.stringify(names));
        }
        s.workflowName = name;
        s.dirty = false;
        s.savedWorkflows = names;
      }),

    loadWorkflow: (name) =>
      set((s) => {
        const data = localStorage.getItem(`workflow.${name}`);
        if (!data) return;
        try {
          const parsed = JSON.parse(data) as {
            nodes: Record<string, NodeInstance>;
            edges: EdgeInstance[];
          };
          s.nodes = parsed.nodes;
          s.edges = parsed.edges;
          s.workflowName = name;
          s.dirty = false;
        } catch {
          /* ignore parse errors */
        }
      }),

    loadDefinitions: (json) =>
      set((s) => {
        s.nodeTypes = json.nodes;
        s.typeHierarchy = json.types;
      }),

    addNode: (typeId, position) =>
      set((s) => {
        const id = uuid();
        s.nodes[id] = {
          uuid: id,
          nodeTypeId: typeId,
          position,
          fields: {}
        };
        s.dirty = true;
      }),

    duplicateNode: (origId) =>
      set((s) => {
        const orig = s.nodes[origId];
        if (!orig) return;
        const id = uuid();
        s.nodes[id] = {
          uuid: id,
          nodeTypeId: orig.nodeTypeId,
          position: { x: orig.position.x + 20, y: orig.position.y + 20 },
          fields: { ...orig.fields }
        };
        s.dirty = true;
      }),

    removeNode: (id) =>
      set((s) => {
        delete s.nodes[id];
        s.edges = s.edges.filter(
          (e) => e.from.uuid !== id && e.to.uuid !== id
        );
        s.dirty = true;
      }),

    addEdge: (edge) =>
      set((s) => {
        s.edges.push(edge);
        s.dirty = true;
      }),

    removeEdge: (id) =>
      set((s) => {
        s.edges = s.edges.filter((e) => e.id !== id);
        s.dirty = true;
      }),

    openContextMenu: (menu) =>
      set((s) => {
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
          s.dirty = true;
        }
      }),

    moveNode: (uuid, pos) =>
      set((s) => {
        if (s.nodes[uuid]) {
          s.nodes[uuid].position = pos;
          s.dirty = true;
        }
      })
  }))
);
