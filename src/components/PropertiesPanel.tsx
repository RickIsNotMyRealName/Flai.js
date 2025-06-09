import { useState } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import type { Field, NodeInstance } from '../types';

export default function PropertiesPanel() {
  const selected = useWorkflowStore((s) => s.selected);
  const nodes    = useWorkflowStore((s) => s.nodes);
  const types    = useWorkflowStore((s) => s.nodeTypes);

  const nodeId = selected[0];
  if (!nodeId) return null;

  const node     = nodes[nodeId];
  const nodeType = types.find((t) => t.id === node.nodeTypeId);
  if (!nodeType) return null;

  return (
    <aside className="props">
      <h3>{nodeType.name}</h3>
      {nodeType.fields.map((f) => (
        <FieldInput key={f.id} field={f} node={node} />
      ))}
    </aside>
  );
}

function FieldInput({
  field,
  node
}: {
  field: Field;
  node:  NodeInstance;
}) {
  const [value, setValue] = useState(
    node.fields[field.id] ?? field.default ?? ''
  );

  return (
    <label>
      {field.label}
      <input
        type="text"
        value={String(value)}
        onChange={(e) => setValue(e.target.value)}
      />
    </label>
  );
}
