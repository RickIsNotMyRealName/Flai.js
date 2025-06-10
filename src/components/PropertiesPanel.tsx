import { useState } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import type { Field, NodeInstance } from '../types';
import type { JSX } from 'react';

export default function PropertiesPanel() {
  const editing = useWorkflowStore((s) => s.editing);
  const nodes   = useWorkflowStore((s) => s.nodes);
  const types   = useWorkflowStore((s) => s.nodeTypes);

  const closeEditor = useWorkflowStore((s) => s.closeEditor);

  if (!editing) return null;

  const node     = nodes[editing];
  const nodeType = types.find((t) => t.id === node.nodeTypeId);
  if (!nodeType) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={closeEditor} />
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{nodeType.name}</h3>
        {nodeType.fields.map((f) => (
          <FieldInput key={f.id} field={f} node={node} />
        ))}
        <button onClick={closeEditor}>Close</button>
      </div>
    </>
  );
}

function FieldInput({ field, node }: { field: Field; node: NodeInstance }) {
  const update = useWorkflowStore((s) => s.updateNodeField);
  const initial = node.fields[field.id] ?? field.default ?? (field.type === 'object' ? {} : '');
  const [value, setValue] = useState<any>(initial);
  const [text, setText] = useState(
    field.type === 'object' ? JSON.stringify(initial, null, 2) : ''
  );

  const onChange = (val: unknown) => {
    setValue(val);
    update(node.uuid, field.id, val);
  };

  const onTextChange = (str: string) => {
    setText(str);
    try {
      const parsed = JSON.parse(str);
      setValue(parsed);
      update(node.uuid, field.id, parsed);
    } catch {
      /* keep old value until JSON is valid */
    }
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
        <span className="switch">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="slider" />
        </span>
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
    case 'object':
      input = (
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
        />
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
    <label className="field-label">
      {field.label}
      {input}
    </label>
  );
}
