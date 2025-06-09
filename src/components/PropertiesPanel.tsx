import { useState } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import type { Field, NodeInstance } from '../types';
import type { JSX } from 'react';

export default function PropertiesPanel() {
  const selected = useWorkflowStore((s) => s.selected);
  const nodes    = useWorkflowStore((s) => s.nodes);
  const types    = useWorkflowStore((s) => s.nodeTypes);

  const setSelected = useWorkflowStore((s) => s.setSelected);

  const nodeId = selected[0];
  if (!nodeId) return null;

  const node     = nodes[nodeId];
  const nodeType = types.find((t) => t.id === node.nodeTypeId);
  if (!nodeType) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={() => setSelected([])} />
      <div className="modal">
        <h3>{nodeType.name}</h3>
        {nodeType.fields.map((f) => (
          <FieldInput key={f.id} field={f} node={node} />
        ))}
        <button onClick={() => setSelected([])}>Close</button>
      </div>
    </>
  );
}

function FieldInput({ field, node }: { field: Field; node: NodeInstance }) {
  const update = useWorkflowStore((s) => s.updateNodeField);
  const initial = node.fields[field.id] ?? field.default ?? '';
  const [value, setValue] = useState<any>(initial);

  const onChange = (val: unknown) => {
    setValue(val);
    update(node.uuid, field.id, val);
  };

  let input: JSX.Element;
  switch (field.type) {
    case 'integer':
      input = (
        <input
          type="number"
          step="1"
          value={value as number}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      );
      break;
    case 'float':
      input = (
        <input
          type="number"
          step="0.01"
          value={value as number}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      );
      break;
    case 'bool':
      input = (
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
      );
      break;
    case 'enum':
      input = (
        <select
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
      break;
    default:
      input = (
        <input
          type="text"
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
  }

  return (
    <label style={{ display: 'block', marginBottom: '0.5rem' }}>
      {field.label}
      {input}
    </label>
  );
}
