import { useEffect, useState } from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

interface FieldDef {
  name: string;
  type: string;
  description: string;
  enumText: string;
}

const defaultField = (): FieldDef => ({
  name: '',
  type: 'string',
  description: '',
  enumText: ''
});

export default function SchemaEditor({ value, onChange }: Props) {
  const [fields, setFields] = useState<FieldDef[]>([]);

  // parse incoming value
  useEffect(() => {
    try {
      const obj = JSON.parse(value || '{}');
      const arr: FieldDef[] = Object.entries(obj).map(([key, def]: any) => ({
        name: key,
        type: def.type || 'string',
        description: def.description || '',
        enumText: Array.isArray(def.enum) ? def.enum.join(', ') : ''
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
      if (f.enumText.trim()) {
        prop.enum = f.enumText.split(',').map(s => s.trim()).filter(Boolean);
      }
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

  const addField = () => updateFields(prev => [...prev, defaultField()]);

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
            <option value="integer">integer</option>
            <option value="boolean">boolean</option>
          </select>
          <input
            placeholder="Description"
            value={f.description}
            onChange={e => updateField(i, 'description', e.target.value)}
          />
          <input
            placeholder="Enum values"
            value={f.enumText}
            onChange={e => updateField(i, 'enumText', e.target.value)}
          />
          <button type="button" className="delete-btn" onClick={() => removeField(i)}>
            🗑️
          </button>
        </div>
      ))}
      <button type="button" onClick={addField}>Add Field</button>
    </div>
  );
}
