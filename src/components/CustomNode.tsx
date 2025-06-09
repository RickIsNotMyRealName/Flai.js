// src/components/CustomNode.tsx
import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { clsx } from 'clsx';
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

  return (
    <div className="custom-node">
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
    </div>
  );
}
