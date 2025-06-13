import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuid } from 'uuid';
import type { NodeInstance, NodeType, EdgeInstance, ToolMeta, ToolData } from '../types';

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
  workflowName: string;
  dirty: boolean;
  savedWorkflows: string[];
  toolMeta: ToolMeta | null;
  toast: { message: string; type: 'error' | 'success' } | null;
  setToast: (msg: string, type?: 'error' | 'success') => void;
  refreshSavedWorkflows: () => void;
  saveWorkflow: (name: string) => void;
  loadWorkflow: (name: string) => void;
  saveTool: (name: string) => void;
  loadTool: (name: string) => void;
  setToolMeta: (meta: ToolMeta) => void;
  deleteWorkflow: (name: string) => void;
  duplicateWorkflow: (name: string) => void;
  renameWorkflow: (oldName: string, newName: string) => void;
  renameTool: (oldName: string, newName: string) => void;
  refreshToolNodes: () => void;
  createWorkflow: () => string;

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
  immer((set, get) => {
    const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
    const snapshot = () => ({ nodes: clone(get().nodes), edges: clone(get().edges) });
    const pushUndo = () =>
      set((s) => {
        s.undoStack.push(snapshot());
        s.redoStack = [];
      });

    return {
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
    toolMeta: null,

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
            s.undoStack = [];
            s.redoStack = [];
          } catch {
            /* ignore parse errors */
          }
        }),

    saveTool: (name) => {
      set((s) => {
        const meta = s.toolMeta || { name, description: '', schema: '' };
        const payload: ToolData = { meta, nodes: s.nodes, edges: s.edges };
        localStorage.setItem(`tool.${name}`, JSON.stringify(payload));
        const list = localStorage.getItem('tools');
        const names = list ? JSON.parse(list) : [];
        if (!names.includes(name)) {
          names.push(name);
          localStorage.setItem('tools', JSON.stringify(names));
        }
        s.workflowName = `tool:${name}`;
        s.dirty = false;
      });
      get().refreshToolNodes();
    },

      loadTool: (name) =>
        set((s) => {
          const data = localStorage.getItem(`tool.${name}`);
          if (!data) return;
          try {
            const parsed = JSON.parse(data) as ToolData;
            s.nodes = parsed.nodes;
            s.edges = parsed.edges;
            s.toolMeta = parsed.meta || { name, description: '', schema: '' };
            s.workflowName = `tool:${name}`;
            s.dirty = false;
            s.undoStack = [];
            s.redoStack = [];
          } catch {
            /* ignore parse errors */
          }
        }),

    setToolMeta: (meta) =>
      set((s) => {
        s.toolMeta = meta;
        s.dirty = true;
      }),

    deleteWorkflow: (name) =>
      set((s) => {
        localStorage.removeItem(`workflow.${name}`);
        const list = localStorage.getItem('workflows');
        const names = list ? JSON.parse(list) : [];
        const index = names.indexOf(name);
        if (index !== -1) {
          names.splice(index, 1);
          localStorage.setItem('workflows', JSON.stringify(names));
        }
        if (s.workflowName === name) {
          s.workflowName = 'autosave';
          s.dirty = true;
        }
        s.savedWorkflows = names;
      }),

    duplicateWorkflow: (name) =>
      set((s) => {
        const data = localStorage.getItem(`workflow.${name}`);
        if (!data) return;
        const list = localStorage.getItem('workflows');
        const names = list ? JSON.parse(list) : [];
        let newName = `${name} copy`;
        let i = 2;
        while (names.includes(newName)) {
          newName = `${name} copy ${i++}`;
        }
        localStorage.setItem(`workflow.${newName}`, data);
        names.push(newName);
        localStorage.setItem('workflows', JSON.stringify(names));
        s.savedWorkflows = names;
      }),

    renameWorkflow: (oldName, newName) =>
      set((s) => {
        const data = localStorage.getItem(`workflow.${oldName}`);
        if (!data) return;
        localStorage.setItem(`workflow.${newName}`, data);
        localStorage.removeItem(`workflow.${oldName}`);
        const list = localStorage.getItem('workflows');
        let names = list ? JSON.parse(list) : [];
        const idx = names.indexOf(oldName);
        if (idx !== -1) names.splice(idx, 1);
        if (!names.includes(newName)) names.push(newName);
        localStorage.setItem('workflows', JSON.stringify(names));
        if (s.workflowName === oldName) s.workflowName = newName;
        s.savedWorkflows = names;
      }),

    renameTool: (oldName, newName) => {
      set((s) => {
        const data = localStorage.getItem(`tool.${oldName}`);
        if (!data) return;
        localStorage.setItem(`tool.${newName}`, data);
        localStorage.removeItem(`tool.${oldName}`);
        const list = localStorage.getItem('tools');
        let names = list ? JSON.parse(list) : [];
        const idx = names.indexOf(oldName);
        if (idx !== -1) names.splice(idx, 1);
        if (!names.includes(newName)) names.push(newName);
        localStorage.setItem('tools', JSON.stringify(names));
        if (s.workflowName === `tool:${oldName}`) s.workflowName = `tool:${newName}`;
      });
      get().refreshToolNodes();
    },

    refreshToolNodes: () => {
      const list = localStorage.getItem('tools');
      const names: string[] = list ? JSON.parse(list) : [];
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

    createWorkflow: () => {
      const list = localStorage.getItem('workflows');
      const names = list ? JSON.parse(list) : ([] as string[]);
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
      (pushUndo(),
      set((s) => {
        if (s.nodes[uuid]) {
          s.nodes[uuid].fields[fieldId] = value;
          s.dirty = true;
        }
      })),

      moveNode: (uuid, pos) =>
        (pushUndo(),
        set((s) => {
          if (s.nodes[uuid]) {
            s.nodes[uuid].position = pos;
            s.dirty = true;
          }
        })),

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
