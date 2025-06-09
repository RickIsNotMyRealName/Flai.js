// src/components/EditorCanvas.tsx
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  Connection
} from '@xyflow/react';
import { useCallback, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { useWorkflowStore } from '../store/workflowStore';
import CustomNode from './CustomNode';
import { validateConnection } from "../logic/pinValidation";
import type {
  Node as RFNode,
  Edge as RFEdge,
  EdgeChange,
  NodeChange
} from '@xyflow/react';

const rfNodeTypes = { custom: CustomNode };

/* -------------------------------------------------------------------------- */
/*  OUTER: provides the context                                               */
/* -------------------------------------------------------------------------- */
export default function EditorCanvas() {
  return (
    <ReactFlowProvider>
      <FlowInner />
    </ReactFlowProvider>
  );
}

/* -------------------------------------------------------------------------- */
/*  INNER: all React-Flow hooks live here                                     */
/* -------------------------------------------------------------------------- */
function FlowInner() {
  /* -------- zustand store bindings --------------------------------------- */
  const storeNodes = useWorkflowStore((s) => s.nodes);
  const storeEdges = useWorkflowStore((s) => s.edges);
  const addNode = useWorkflowStore((s) => s.addNode);
  const addEdgeStore = useWorkflowStore((s) => s.addEdge);
  const removeEdge = useWorkflowStore((s) => s.removeEdge);
  const moveNode = useWorkflowStore((s) => s.moveNode);
  const setSelected = useWorkflowStore((s) => s.setSelected);
  const openContextMenu = useWorkflowStore((s) => s.openContextMenu);

  const nodeDefs = useWorkflowStore((s) => s.nodeTypes);
  const hierarchy = useWorkflowStore((s) => s.typeHierarchy);
  const setError = useWorkflowStore((s) => s.setError);
  /* -------- local RF state mirrors the store ----------------------------- */
  const [nodes, setNodes, onNodesChange] = useNodesState<RFNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RFEdge>([]);

  useEffect(() => {
    setNodes(
      Object.values(storeNodes).map((n) => ({
        id: n.uuid,
        type: 'custom',
        position: n.position,
        data: { node: n }
      }))
    );
  }, [storeNodes, setNodes]);

  useEffect(() => {
    setEdges(
      storeEdges.map((e) => ({
        id: e.id,
        source: e.from.uuid,
        sourceHandle: e.from.pin,
        target: e.to.uuid,
        targetHandle: e.to.pin
      }))
    );
  }, [storeEdges, setEdges]);

  /* -------- drag-and-drop ------------------------------------------------- */
  const { screenToFlowPosition } = useReactFlow<RFNode, RFEdge>();

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((c) => {
        if (c.type === 'position' && c.position) {
          moveNode(c.id as string, c.position);
        }
      });
      onNodesChange(changes);
    },
    [onNodesChange, moveNode]
  );

  const onDrop = useCallback(
    (evt: React.DragEvent) => {
      evt.preventDefault();
      const typeId = evt.dataTransfer.getData('application/x-node-type');
      if (!typeId) return;

      const pos = screenToFlowPosition({ x: evt.clientX, y: evt.clientY });
      addNode(typeId, pos);
    },
    [addNode]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  /* -------- connect pins -------------------------------------------------- */
  const onConnect = useCallback(
    (c: Connection) => {
      if (!c.source || !c.target || !c.sourceHandle || !c.targetHandle) return;
      const fromNode = storeNodes[c.source];
      const toNode = storeNodes[c.target];
      if (!fromNode || !toNode) return;

      const fromType = nodeDefs.find((nt) => nt.id === fromNode.nodeTypeId)!;
      const toType = nodeDefs.find((nt) => nt.id === toNode.nodeTypeId)!;
      const fromPin = fromType.outputs.find((p) => p.id === c.sourceHandle)!;
      const toPin = toType.inputs.find((p) => p.id === c.targetHandle)!;

      const err = validateConnection(
        fromNode,
        fromPin,
        toNode,
        toPin,
        hierarchy,
        storeEdges
      );

      if (err) {
        setError(err);
        return;
      }

      addEdgeStore({
        id: uuid(),
        from: { uuid: c.source, pin: c.sourceHandle },
        to: { uuid: c.target, pin: c.targetHandle }
      });
    },
    [addEdgeStore, storeNodes, nodeDefs, hierarchy, storeEdges, setError]
  );

  /* ----------------------------------------------------------------------- */
  return (
    <div style={{ flex: 1 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={rfNodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={(changes) => {
          changes.forEach((c) => c.type === 'remove' && removeEdge(c.id as string));
          onEdgesChange(changes);
        }}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onSelectionChange={(sel) => setSelected(sel.nodes.map((n) => n.id))}
        onNodeContextMenu={(e, node) => {
          e.preventDefault();
          openContextMenu({
            type: 'node',
            id: node.id as string,
            position: { x: e.clientX, y: e.clientY }
          });
        }}
        onEdgeContextMenu={(e, edge) => {
          e.preventDefault();
          openContextMenu({
            type: 'edge',
            id: edge.id as string,
            position: { x: e.clientX, y: e.clientY }
          });
        }}
        onPaneClick={() => openContextMenu(null)}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
