import { useEffect, useState } from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

interface FieldDef {
  name: string;
  type: string;
  description: string;
}

const defaultField = (): FieldDef => ({
  name: '',
  type: 'string',
  description: ''
});

export default function SchemaEditor({ value, onChange }: Props) {
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [adding, setAdding] = useState(false);
  const [newField, setNewField] = useState<FieldDef>(defaultField());

  // parse incoming value
  useEffect(() => {
    try {
      const obj = JSON.parse(value || '{}');
      const arr: FieldDef[] = Object.entries(obj).map(([key, def]: any) => ({
        name: key,
        type: def.type || 'string',
        description: def.description || ''
      }));
      if (arr.length === 0) arr.push(defaultField());
      setFields(arr);
    } catch {
      setFields([defaultField()]);
    }
  }, [value]);

  const buildSchema = (defs: FieldDef[]) => {
    const obj: Record<string, any> = {};
    defs.forEach(f => {
      if (!f.name) return;
      const prop: any = { type: f.type };
      if (f.description) prop.description = f.description;
      obj[f.name] = prop;
    });
    return JSON.stringify(obj, null, 2);
  };

  const updateFields = (updater: (prev: FieldDef[]) => FieldDef[]) => {
    setFields(prev => {
      const next = updater(prev);
      onChange(buildSchema(next));
      return next;
    });
  };

  const updateField = (idx: number, key: keyof FieldDef, val: string) => {
    updateFields(prev => {
      const next = prev.slice();
      next[idx] = { ...next[idx], [key]: val };
      return next;
    });
  };

  const addField = () => {
    setNewField(defaultField());
    setAdding(true);
  };

  const removeField = (idx: number) => updateFields(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className="schema-editor">
      {fields.map((f, i) => (
        <div className="schema-field" key={i}>
          <input
            placeholder="Name"
            value={f.name}
            onChange={e => updateField(i, 'name', e.target.value)}
          />
          <select value={f.type} onChange={e => updateField(i, 'type', e.target.value)}>
            <option value="string">string</option>
            <option value="number">number</option>
            <option value="object">object</option>
            <option value="array">array</option>
            <option value="boolean">boolean</option>
            <option value="null">null</option>
          </select>
          <input
            placeholder="Description"
            value={f.description}
            onChange={e => updateField(i, 'description', e.target.value)}
          />
          <button type="button" className="delete-btn" onClick={() => removeField(i)}>
            🗑️
          </button>
        </div>
      ))}
      <button type="button" onClick={addField}>Add Field</button>
      {adding && (
        <>
          <div className="modal-backdrop" onClick={() => setAdding(false)} />
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add Field</h3>
            <label className="field-label">
              Name
              <input
                type="text"
                value={newField.name}
                onChange={e => setNewField({ ...newField, name: e.target.value })}
              />
            </label>
            <label className="field-label">
              Description
              <input
                type="text"
                value={newField.description}
                onChange={e =>
                  setNewField({ ...newField, description: e.target.value })
                }
              />
            </label>
            <label className="field-label">
              Type
              <select
                value={newField.type}
                onChange={e => setNewField({ ...newField, type: e.target.value })}
              >
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="object">object</option>
                <option value="array">array</option>
                <option value="boolean">boolean</option>
                <option value="null">null</option>
              </select>
            </label>
            <div className="modal-buttons">
              <button onClick={() => setAdding(false)}>Cancel</button>
              <button
                onClick={() => {
                  if (!newField.name) return;
                  updateFields(prev => [...prev, newField]);
                  setAdding(false);
                }}
              >
                Add
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
