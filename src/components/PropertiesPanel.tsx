import { useState, useEffect } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import type { Field, NodeInstance } from '../types';
import type { JSX } from 'react';
import {
  SchemaEntry,
  parseSchema,
  buildSchema,
} from '../logic/schemaUtils';

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
        <SchemaEditor initial={value} onChange={onChange} />
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



function SchemaEditor({
  initial,
  onChange,
}: {
  initial: any;
  onChange: (v: any) => void;
}) {
  const [entries, setEntries] = useState<SchemaEntry[]>(() => parseSchema(initial));

  useEffect(() => {
    onChange(buildSchema(entries));
  }, [entries]);

  const update = (i: number, entry: SchemaEntry) => {
    const copy = entries.slice();
    copy[i] = entry;
    setEntries(copy);
  };

  const remove = (i: number) => {
    const copy = entries.slice();
    copy.splice(i, 1);
    setEntries(copy);
  };

  const add = () => {
    setEntries([...entries, { name: '', type: 'string', required: false }]);
  };

  return (
    <div className="schema-editor">
      {entries.map((e, i) => (
        <div key={i} className="schema-row">
          <input
            placeholder="name"
            value={e.name}
            onChange={(ev) => update(i, { ...e, name: ev.target.value })}
          />
          <select
            value={e.type}
            onChange={(ev) => update(i, { ...e, type: ev.target.value })}
          >
            <option value="string">string</option>
            <option value="integer">integer</option>
            <option value="number">number</option>
            <option value="boolean">boolean</option>
          </select>
          <label className="req">
            <input
              type="checkbox"
              checked={e.required}
              onChange={(ev) => update(i, { ...e, required: ev.target.checked })}
            />
            required
          </label>
          <button onClick={() => remove(i)}>✕</button>
        </div>
      ))}
      <button onClick={add}>Add Field</button>
    </div>
  );
}

