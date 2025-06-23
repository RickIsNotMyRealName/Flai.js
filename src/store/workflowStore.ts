import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuid } from 'uuid';
import type { NodeInstance, NodeType, EdgeInstance, ToolMeta, ToolData } from '../types';
import * as api from '../api';

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
  undoStack: { nodes: Record<string, NodeInstance>; edges: EdgeInstance[] }[];
  redoStack: { nodes: Record<string, NodeInstance>; edges: EdgeInstance[] }[];
  undo: () => void;
  redo: () => void;
  recordSnapshot: () => void;
  workflowName: string;
  dirty: boolean;
  savedWorkflows: string[];
  toolMeta: ToolMeta | null;
  toast: { message: string; type: 'error' | 'success' } | null;
  setToast: (msg: string, type?: 'error' | 'success') => void;
  refreshSavedWorkflows: () => Promise<void>;
  saveWorkflow: (name: string) => Promise<void>;
  loadWorkflow: (name: string) => Promise<void>;
  saveTool: (name: string) => Promise<void>;
  loadTool: (name: string) => Promise<void>;
  setToolMeta: (meta: ToolMeta) => void;
  deleteWorkflow: (name: string) => Promise<void>;
  duplicateWorkflow: (name: string) => Promise<void>;
  renameWorkflow: (oldName: string, newName: string) => Promise<void>;
  renameTool: (oldName: string, newName: string) => Promise<void>;
  refreshToolNodes: () => Promise<void>;
  createWorkflow: () => Promise<string>;

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
  setTheme: (t: 'light' | 'dark') => Promise<void>;
  setSelected: (ids: string[]) => void;
  openEditor: (id: string) => void;
  closeEditor: () => void;
  updateNodeField: (uuid: string, fieldId: string, value: unknown) => void;
  moveNode: (uuid: string, pos: { x: number; y: number }) => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  immer((set, get) => {
    const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
    const snapshot = () => ({ nodes: clone(get().nodes), edges: clone(get().edges) });
    const pushUndo = () =>
      set((s) => {
        s.undoStack.push(snapshot());
        s.redoStack = [];
      });

    api.getSettings().then((cfg) =>
      set((s) => {
        if (cfg && cfg.theme) s.theme = cfg.theme as 'light' | 'dark';
      })
    );

    return {
    toast: null,
    nodeTypes: [],
    typeHierarchy: {},
    nodes: {},
    edges: [],
    selected: [],
    editing: null,
    contextMenu: null,
    theme: 'light',
    undoStack: [],
    redoStack: [],
    workflowName: 'autosave',
    dirty: false,
    savedWorkflows: [],
    toolMeta: null,

    setToast: (msg, type = 'error') =>
      set((s) => {
        s.toast = { message: msg, type };
        /* auto-clear after 3 s */
        setTimeout(() => set((st) => void (st.toast = null)), 3000);
      }),

    refreshSavedWorkflows: async () => {
      const names = await api.listWorkflows();
      set((s) => {
        s.savedWorkflows = names;
      });
    },

    saveWorkflow: async (name) => {
      await api.saveWorkflow(name, { nodes: get().nodes, edges: get().edges });
      await get().refreshSavedWorkflows();
      set((s) => {
        s.workflowName = name;
        s.dirty = false;
      });
    },

    loadWorkflow: async (name) => {
      const data = await api.getWorkflow(name);
      if (!data) return;
      set((s) => {
        s.nodes = data.nodes;
        s.edges = data.edges;
        s.workflowName = name;
        s.dirty = false;
        s.undoStack = [];
        s.redoStack = [];
      });
    },

    saveTool: async (name) => {
      const meta = get().toolMeta || { name, description: '', schema: '' };
      const payload: ToolData = { meta, nodes: get().nodes, edges: get().edges };
      await api.saveTool(name, payload);
      set((s) => {
        s.workflowName = `tool:${name}`;
        s.dirty = false;
      });
      await get().refreshToolNodes();
    },

    loadTool: async (name) => {
      const data = await api.getTool(name);
      if (!data) return;
      set((s) => {
        s.nodes = data.nodes;
        s.edges = data.edges;
        s.toolMeta = data.meta || { name, description: '', schema: '' };
        s.workflowName = `tool:${name}`;
        s.dirty = false;
        s.undoStack = [];
        s.redoStack = [];
      });
    },

    setToolMeta: (meta) =>
      set((s) => {
        s.toolMeta = meta;
        s.dirty = true;
      }),

    deleteWorkflow: async (name) => {
      await api.deleteWorkflow(name);
      await get().refreshSavedWorkflows();
      set((s) => {
        if (s.workflowName === name) {
          s.workflowName = 'autosave';
          s.dirty = true;
        }
      });
    },

    duplicateWorkflow: async (name) => {
      const data = await api.getWorkflow(name);
      if (!data) return;
      const names = await api.listWorkflows();
      let newName = `${name} copy`;
      let i = 2;
      while (names.includes(newName)) {
        newName = `${name} copy ${i++}`;
      }
      await api.saveWorkflow(newName, data);
      await get().refreshSavedWorkflows();
    },

    renameWorkflow: async (oldName, newName) => {
      const data = await api.getWorkflow(oldName);
      if (!data) return;
      await api.deleteWorkflow(oldName);
      await api.saveWorkflow(newName, data);
      await get().refreshSavedWorkflows();
      set((s) => {
        if (s.workflowName === oldName) s.workflowName = newName;
      });
    },

    renameTool: async (oldName, newName) => {
      const data = await api.getTool(oldName);
      if (!data) return;
      await api.deleteTool(oldName);
      await api.saveTool(newName, data);
      if (get().workflowName === `tool:${oldName}`) {
        set((s) => { s.workflowName = `tool:${newName}`; });
      }
      await get().refreshToolNodes();
    },

    refreshToolNodes: async () => {
      const names: string[] = await api.listTools();
      set((s) => {
        s.nodeTypes = s.nodeTypes.filter(
          (nt) => !nt.id.startsWith('tool.custom.')
        );
        names.forEach((name) => {
          const slug = name.replace(/[^a-z0-9]/gi, '_');
          const typeId = `tool.custom.${slug}`;
          const outType = `CustomTool_${slug}`;
          s.nodeTypes.push({
            id: typeId,
            name,
            tags: ['tool', 'custom'],
            category: 'Custom Tools',
            layout: 'singleRow',
            inputs: [],
            outputs: [
              {
                id: 'toolOut',
                name: 'Tool',
                direction: 'output',
                type: outType,
                cardinality: 'many',
              },
            ],
            fields: [],
            editors: ['agent', 'tool'],
          });
          s.typeHierarchy[outType] = 'Tool';
        });
      });
    },

    createWorkflow: async () => {
      const names = await api.listWorkflows();
      let idx = 1;
      const base = 'Untitled';
      let name = `${base} ${idx}`;
      while (names.includes(name)) {
        name = `${base} ${++idx}`;
      }
      set((s) => {
        s.nodes = {};
        s.edges = [];
        s.workflowName = name;
        /* mark as clean so autosave doesn't immediately persist */
        s.dirty = false;
        s.undoStack = [];
        s.redoStack = [];
      });
      await api.saveWorkflow(name, { nodes: {}, edges: [] });
      await get().refreshSavedWorkflows();
      return name;
    },

    loadDefinitions: (json) => {
      set((s) => {
        s.nodeTypes = json.nodes;
        s.typeHierarchy = json.types;
      });
      get().refreshToolNodes();
    },

    addNode: (typeId, position) =>
      (pushUndo(),
      set((s) => {
        const id = uuid();
        s.nodes[id] = {
          uuid: id,
          nodeTypeId: typeId,
          position,
          fields: {}
        };
        s.dirty = true;
      })),

    duplicateNode: (origId) =>
      (pushUndo(),
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
      })),

    removeNode: (id) =>
      (pushUndo(),
      set((s) => {
        delete s.nodes[id];
        s.edges = s.edges.filter(
          (e) => e.from.uuid !== id && e.to.uuid !== id
        );
        s.dirty = true;
      })),

    addEdge: (edge) =>
      (pushUndo(),
      set((s) => {
        s.edges.push(edge);
        s.dirty = true;
      })),

    removeEdge: (id) =>
      (pushUndo(),
      set((s) => {
        s.edges = s.edges.filter((e) => e.id !== id);
        s.dirty = true;
      })),

    openContextMenu: (menu) =>
      set((s) => {
        s.contextMenu = menu;
      }),

    setTheme: async (t) => {
      await api.saveSettings({ theme: t });
      set((s) => {
        s.theme = t;
      });
    },

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
      (pushUndo(),
      set((s) => {
        if (s.nodes[uuid]) {
          s.nodes[uuid].fields[fieldId] = value;
          s.dirty = true;
        }
      })),

      moveNode: (uuid, pos) =>
        set((s) => {
          if (s.nodes[uuid]) {
            s.nodes[uuid].position = pos;
            s.dirty = true;
          }
        }),

      recordSnapshot: pushUndo,

      undo: () => {
        const snap = snapshot();
        set((s) => {
          const prev = s.undoStack.pop();
          if (!prev) return;
          s.redoStack.push(snap);
          s.nodes = prev.nodes;
          s.edges = prev.edges;
        });
      },

      redo: () => {
        const snap = snapshot();
        set((s) => {
          const next = s.redoStack.pop();
          if (!next) return;
          s.undoStack.push(snap);
          s.nodes = next.nodes;
          s.edges = next.edges;
        });
      }
    };
  })
);
