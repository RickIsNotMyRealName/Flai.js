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
import { useCallback, useEffect, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import { useWorkflowStore } from '../store/workflowStore';
import CustomNode from './CustomNode';
import DeletableEdge from './DeletableEdge';
import { validateConnection } from "../logic/pinValidation";
import type {
  Node as RFNode,
  Edge as RFEdge,
  EdgeChange,
  NodeChange
} from '@xyflow/react';

const rfNodeTypes = { custom: CustomNode };
const rfEdgeTypes = { deletable: DeletableEdge };

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
  const recordSnapshot = useWorkflowStore((s) => s.recordSnapshot);
  const setSelected = useWorkflowStore((s) => s.setSelected);

  const nodeDefs = useWorkflowStore((s) => s.nodeTypes);
  const hierarchy = useWorkflowStore((s) => s.typeHierarchy);
  const setToast = useWorkflowStore((s) => s.setToast);
  /* -------- local RF state mirrors the store ----------------------------- */
  const [nodes, setNodes, onNodesChange] = useNodesState<RFNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RFEdge>([]);
  const syncingRef = useRef(false);

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
    syncingRef.current = true;
    setEdges(
      storeEdges.map((e) => ({
        id: e.id,
        type: 'deletable',
        source: e.from.uuid,
        sourceHandle: e.from.pin,
        target: e.to.uuid,
        targetHandle: e.to.pin
      }))
    );
  }, [storeEdges, setEdges]);

  /* -------- drag-and-drop ------------------------------------------------- */
  const { screenToFlowPosition } = useReactFlow<RFNode, RFEdge>();
  const dragRef = useRef(false);

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

  const onNodeDragStart = useCallback(() => {
    if (!dragRef.current) {
      recordSnapshot();
      dragRef.current = true;
    }
  }, [recordSnapshot]);

  const onNodeDragStop = useCallback(() => {
    dragRef.current = false;
  }, []);

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
        setToast(err, 'error');
        return;
      }

      addEdgeStore({
        id: uuid(),
        from: { uuid: c.source, pin: c.sourceHandle },
        to: { uuid: c.target, pin: c.targetHandle }
      });
    },
    [addEdgeStore, storeNodes, nodeDefs, hierarchy, storeEdges, setToast]
  );

  /* ----------------------------------------------------------------------- */
  return (
    <div style={{ flex: 1 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={rfNodeTypes}
        edgeTypes={rfEdgeTypes}
        onNodesChange={handleNodesChange}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onEdgesChange={(changes) => {
          if (syncingRef.current) {
            syncingRef.current = false;
            return;
          }
          changes.forEach((c) => c.type === 'remove' && removeEdge(c.id as string));
          onEdgesChange(changes);
        }}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onSelectionChange={(sel) => {
          setSelected(sel.nodes.map((n) => n.id));
        }}
        onNodeContextMenu={(e, node) => {
          e.preventDefault();
          setSelected([node.id as string]);
        }}
        onEdgeContextMenu={(e, edge) => {
          e.preventDefault();
          syncingRef.current = true;
          setEdges((eds) =>
            eds.map((el) => ({ ...el, selected: el.id === edge.id }))
          );
        }}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
