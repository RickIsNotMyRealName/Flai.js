// src/components/CustomNode.tsx
import { Handle, Node, NodeProps, Position, NodeToolbar } from '@xyflow/react';
import { useState, useRef } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import type { NodeInstance } from '../types';

type CustomData = { node: NodeInstance };
export type RFNode = Node<CustomData>;

/**
 * Renders a node with:
 *  - one title row (icon + name)
 *  - one row per input (handle left + label)
 *  - one row per output (label + handle right)
 */
export default function CustomNode({ data }: NodeProps<RFNode>) {
  const nodeInst = data.node;
  const nodeType = useWorkflowStore(
    (s) => s.nodeTypes.find((nt) => nt.id === nodeInst.nodeTypeId)!
  );
  const openEditor = useWorkflowStore((s) => s.openEditor);
  const removeNode = useWorkflowStore((s) => s.removeNode);
  const duplicateNode = useWorkflowStore((s) => s.duplicateNode);
  const [hovered, setHovered] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setHovered(true);
  };

  const hide = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
    hideTimer.current = setTimeout(() => {
      setHovered(false);
      hideTimer.current = null;
    }, 150);
  };

  return (
    <div
      className="custom-node"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <NodeToolbar
        className="node-toolbar"
        isVisible={hovered}
        position={Position.Bottom}
        align="center"
        offset={4}
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        <button onClick={() => duplicateNode(nodeInst.uuid)} aria-label="Duplicate">⧉</button>
        <button onClick={() => removeNode(nodeInst.uuid)} aria-label="Delete">✖</button>
      </NodeToolbar>
      {/* Title row */}
      <div className="node-row title">
        {nodeType.icon && <img src={nodeType.icon} alt="" className="icon" />}
        <span>{nodeType.name}</span>
      </div>

      {/* Inputs */}
      {nodeType.inputs.map((pin) => (
        <div key={pin.id} className="node-row pin-row input-row">
          <Handle
            type="target"
            position={Position.Left}
            id={pin.id}
            className="pin pin-left"
          />
          <span className="pin-label">{pin.name}</span>
        </div>
      ))}

      {/* Outputs */}
      {nodeType.outputs.map((pin) => (
        <div key={pin.id} className="node-row pin-row output-row">
          <span className="pin-label">{pin.name}</span>
          <Handle
            type="source"
            position={Position.Right}
            id={pin.id}
            className="pin pin-right"
          />
        </div>
      ))}

      {nodeType.fields.length > 0 && (
        <div className="node-row edit-row">
          <button className="edit-btn" onClick={() => openEditor(nodeInst.uuid)}>
            Edit
          </button>
        </div>
      )}
    </div>
  );
}
