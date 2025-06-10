import { useEffect, useState } from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

interface FieldDef {
  name: string;
  type: string;
  description: string;
  enums: string[];
}

const defaultField = (): FieldDef => ({
  name: '',
  type: 'string',
  description: '',
  enums: []
});

export default function SchemaEditor({ value, onChange }: Props) {
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [adding, setAdding] = useState(false);
  const [newField, setNewField] = useState<FieldDef>(defaultField());
  const [enumInputs, setEnumInputs] = useState<Record<number, string>>({});
  const [newEnumInput, setNewEnumInput] = useState('');

  // parse incoming value
  useEffect(() => {
    try {
      const obj = JSON.parse(value || '{}');
      const arr: FieldDef[] = Object.entries(obj).map(([key, def]: any) => ({
        name: key,
        type: def.type || 'string',
        description: def.description || '',
        enums: Array.isArray(def.enum)
          ? def.enum.map((v: any) => String(v))
          : []
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
      const vals = f.enums.map(v => v.trim()).filter(Boolean);
      if (vals.length) prop.enum = vals;
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

  const updateEnum = (fieldIdx: number, enumIdx: number, val: string) => {
    updateFields(prev => {
      const next = prev.slice();
      const enums = next[fieldIdx].enums.slice();
      enums[enumIdx] = val;
      next[fieldIdx] = { ...next[fieldIdx], enums };
      return next;
    });
  };

  const addEnum = (fieldIdx: number) => {
    const val = (enumInputs[fieldIdx] || '').trim();
    if (!val) return;
    updateFields(prev => {
      const next = prev.slice();
      const enums = next[fieldIdx].enums.concat(val);
      next[fieldIdx] = { ...next[fieldIdx], enums };
      return next;
    });
    setEnumInputs(inputs => ({ ...inputs, [fieldIdx]: '' }));
  };

  const removeEnum = (fieldIdx: number, enumIdx: number) => {
    updateFields(prev => {
      const next = prev.slice();
      const enums = next[fieldIdx].enums.filter((_, i) => i !== enumIdx);
      next[fieldIdx] = { ...next[fieldIdx], enums };
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
      <ul>
        {fields.map((f, i) => (
          <li className="schema-field" key={i}>
            <details>
            <summary className="field-summary">
              <span>{f.name || `Field ${i + 1}`}</span>
              <button
                type="button"
                className="delete-btn"
                onClick={() => removeField(i)}
                aria-label="Delete field"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <line
                    x1="1"
                    y1="1"
                    x2="11"
                    y2="11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="11"
                    y1="1"
                    x2="1"
                    y2="11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </summary>
            <div className="field-body">
              <label className="field-label">
                Name
                <input
                  type="text"
                  value={f.name}
                  onChange={e => updateField(i, 'name', e.target.value)}
                />
              </label>
              <label className="field-label">
                Description
                <input
                  type="text"
                  value={f.description}
                  onChange={e => updateField(i, 'description', e.target.value)}
                />
              </label>
              <label className="field-label">
                Enum Values
                <div className="enum-list">
                  {f.enums.map((val, j) => (
                    <div className="enum-item" key={j}>
                      <input
                        type="text"
                        value={val}
                        onChange={e => updateEnum(i, j, e.target.value)}
                      />
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => removeEnum(i, j)}
                        aria-label="Delete enum"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                          <line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <div className="enum-item">
                    <input
                      type="text"
                      value={enumInputs[i] || ''}
                      onChange={e => setEnumInputs(inp => ({ ...inp, [i]: e.target.value }))}
                    />
                    <button type="button" onClick={() => addEnum(i)}>Add</button>
                  </div>
                </div>
              </label>
              <label className="field-label">
                Type
                <select value={f.type} onChange={e => updateField(i, 'type', e.target.value)}>
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="object">object</option>
                  <option value="array">array</option>
                  <option value="boolean">boolean</option>
                  <option value="null">null</option>
                </select>
              </label>
            </div>
          </details>
          </li>
        ))}
      </ul>
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
              Enum Values
              <div className="enum-list">
                {newField.enums.map((val, j) => (
                  <div className="enum-item" key={j}>
                    <input
                      type="text"
                      value={val}
                      onChange={e =>
                        setNewField({
                          ...newField,
                          enums: newField.enums.map((v, k) =>
                            k === j ? e.target.value : v
                          )
                        })
                      }
                    />
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() =>
                        setNewField({
                          ...newField,
                          enums: newField.enums.filter((_, i) => i !== j)
                        })
                      }
                      aria-label="Delete enum"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ))}
                <div className="enum-item">
                  <input
                    type="text"
                    value={newEnumInput}
                    onChange={e => setNewEnumInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newEnumInput.trim()) return;
                      setNewField({
                        ...newField,
                        enums: [...newField.enums, newEnumInput.trim()]
                      });
                      setNewEnumInput('');
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
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
