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
import type {
  Node as RFNode,
  Edge as RFEdge,
  EdgeChange,
  NodeChange
} from '@xyflow/react';

const nodeTypes = { custom: CustomNode };

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
    (c: Connection) =>
      addEdgeStore({
        id: uuid(),
        from: { uuid: c.source!, pin: c.sourceHandle! },
        to: { uuid: c.target!, pin: c.targetHandle! }
      }),
    [addEdgeStore]
  );

  /* ----------------------------------------------------------------------- */
  return (
    <div style={{ flex: 1 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={(changes) => {
          changes.forEach((c) => c.type === 'remove' && removeEdge(c.id as string));
          onEdgesChange(changes);
        }}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
