import { useEffect, useState } from 'react';

interface AssistantData {
  name: string;
  system: string;
  model: string;
  tools: string[];
}

export default function AssistantEditPage({ name: orig, onBack }: { name: string; onBack: () => void }) {
  const [name, setName] = useState(orig);
  const [system, setSystem] = useState('');
  const [model, setModel] = useState('');
  const [tools, setTools] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>([]);
  const [newTool, setNewTool] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem(`assistant.${orig}`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<AssistantData>;
        setName(parsed.name || orig);
        setSystem(parsed.system || (parsed as any).instructions || '');
        setModel(parsed.model || '');
        setTools(parsed.tools || []);
      } catch {
        setName(orig);
        setSystem('');
        setModel('');
        setTools([]);
      }
    }
    const list = localStorage.getItem('tools');
    setAvailable(list ? JSON.parse(list) : []);
  }, [orig]);

  const addTool = () => {
    if (newTool && !tools.includes(newTool)) {
      setTools(ts => [...ts, newTool]);
      setNewTool('');
    }
  };

  const removeTool = (t: string) => {
    setTools(ts => ts.filter(x => x !== t));
  };

  const save = () => {
    const listRaw = localStorage.getItem('assistants');
    const names: string[] = listRaw ? JSON.parse(listRaw) : [];
    let target = orig;
    if (name && name !== orig) {
      if (names.includes(name)) {
        alert('Name already exists');
        return;
      }
      const idx = names.indexOf(orig);
      if (idx !== -1) names[idx] = name;
      localStorage.removeItem(`assistant.${orig}`);
      target = name;
    }
    localStorage.setItem('assistants', JSON.stringify(names));
    const payload: AssistantData = { name: target, system, model, tools };
    localStorage.setItem(`assistant.${target}`, JSON.stringify(payload));
    onBack();
  };

  return (
    <main className="main editor-page">
      <div className="page-header editor-header">
        <button className="back-btn" onClick={onBack} aria-label="Back">
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <polyline
              points="15 18 9 12 15 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h2 className="editor-title">Assistant</h2>
      </div>
      <div className="editor-main" style={{ padding: '1rem', overflowY: 'auto' }}>
        <div style={{ flex: 1 }}>
          <label className="field-label">
            Name
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="field-label">
            System Message
            <textarea
              style={{ width: '100%', height: '6em' }}
              value={system}
              onChange={(e) => setSystem(e.target.value)}
            />
          </label>
          <label className="field-label">
            Chat Model
            <input type="text" value={model} onChange={(e) => setModel(e.target.value)} />
          </label>
          <div className="field-label">
            Tools
            <div className="enum-tags">
              {tools.map((t) => (
                <span className="enum-tag" key={t}>
                  {t}
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => removeTool(t)}
                    aria-label="Remove tool"
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
              <select value={newTool} onChange={(e) => setNewTool(e.target.value)}>
                <option value="">Select tool...</option>
                {available
                  .filter((t) => !tools.includes(t))
                  .map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
              </select>
              <button type="button" className="add-btn" onClick={addTool} aria-label="Add tool">
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
          <div className="modal-buttons">
            <button onClick={onBack}>Cancel</button>
            <button onClick={save}>Save</button>
          </div>
        </div>
      </div>
    </main>
  );
}
