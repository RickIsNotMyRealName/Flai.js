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
  removeNode: (uuid: string) => void;
  addEdge: (edge: EdgeInstance) => void;
  removeEdge: (id: string) => void;
  setTheme: (t: 'light' | 'dark') => void;
  setSelected: (ids: string[]) => void;
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
      }),

    removeNode: (id) =>
      set((s) => {
        delete s.nodes[id];
        s.edges = s.edges.filter(
          (e) => e.from.uuid !== id && e.to.uuid !== id
        );
      }),

    addEdge: (edge) =>
      set((s) => {
        s.edges.push(edge);
      }),

    removeEdge: (id) =>
      set((s) => {
        s.edges = s.edges.filter((e) => e.id !== id);
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
