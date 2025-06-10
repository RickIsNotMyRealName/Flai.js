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

const isValidEnum = (type: string, val: string): boolean => {
  const t = val.trim();
  if (!t) return false;
  try {
    switch (type) {
      case 'number':
        return !isNaN(Number(t));
      case 'boolean':
        return t === 'true' || t === 'false';
      case 'null':
        return t === 'null';
      case 'object':
        return typeof JSON.parse(t) === 'object' && !Array.isArray(JSON.parse(t));
      case 'array':
        return Array.isArray(JSON.parse(t));
      default:
        return true;
    }
  } catch {
    return false;
  }
};

const parseEnum = (type: string, val: string): any => {
  const t = val.trim();
  switch (type) {
    case 'number':
      return Number(t);
    case 'boolean':
      return t === 'true';
    case 'null':
      return null;
    case 'object':
    case 'array':
      return JSON.parse(t);
    default:
      return t;
  }
};

export default function SchemaEditor({ value, onChange }: Props) {
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [enumInputs, setEnumInputs] = useState<Record<number, string>>({});
  const [enumErrors, setEnumErrors] = useState<Record<number, string>>({});

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
      const vals = f.enums
        .map(v => v.trim())
        .filter(Boolean)
        .map(v => parseEnum(f.type, v));
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


  const addEnum = (fieldIdx: number) => {
    const val = (enumInputs[fieldIdx] || '').trim();
    if (!val) return;
    if (!isValidEnum(fields[fieldIdx].type, val)) {
      setEnumErrors(errs => ({ ...errs, [fieldIdx]: 'Invalid value' }));
      return;
    }
    updateFields(prev => {
      const next = prev.slice();
      const enums = next[fieldIdx].enums.concat(val);
      next[fieldIdx] = { ...next[fieldIdx], enums };
      return next;
    });
    setEnumInputs(inputs => ({ ...inputs, [fieldIdx]: '' }));
    setEnumErrors(errs => ({ ...errs, [fieldIdx]: '' }));
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
    updateFields(prev => [...prev, defaultField()]);
  };

  const removeField = (idx: number) => updateFields(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className="schema-editor">
      <ul>
        {fields.map((f, i) => (
          <li className="schema-field" key={i}>
            <details>
            <summary className="field-summary">
              <input
                className="field-name"
                type="text"
                value={f.name}
                placeholder={`Field ${i + 1}`}
                onChange={e => updateField(i, 'name', e.target.value)}
              />
              <input
                className="field-desc"
                type="text"
                value={f.description}
                placeholder="Description"
                onChange={e => updateField(i, 'description', e.target.value)}
              />
              <select
                className="field-type"
                value={f.type}
                onChange={e => updateField(i, 'type', e.target.value)}
              >
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="object">object</option>
                <option value="array">array</option>
                <option value="boolean">boolean</option>
                <option value="null">null</option>
              </select>
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
                Enum Values
                <div className="enum-tags">
                  {f.enums.map((val, j) => (
                    <span className="enum-tag" key={j}>
                      {val}
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => removeEnum(i, j)}
                        aria-label="Delete enum"
                      >
                        <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
                          <line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="enum-item">
                  <input
                    type="text"
                    value={enumInputs[i] || ''}
                    onChange={e => setEnumInputs(inp => ({ ...inp, [i]: e.target.value }))}
                  />
                  <button type="button" className="add-btn" onClick={() => addEnum(i)} aria-label="Add enum">
                    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                      <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                {enumErrors[i] && <div className="enum-error">{enumErrors[i]}</div>}
              </label>
            </div>
          </details>
          </li>
        ))}
      </ul>
      <button type="button" onClick={addField}>Add Field</button>
    </div>
  );
}
