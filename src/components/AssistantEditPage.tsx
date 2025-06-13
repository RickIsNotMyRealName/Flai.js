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

  const toggleTool = (t: string) => {
    setTools((ts) =>
      ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]
    );
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
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {available.map((t) => (
                <li key={t}>
                  <label>
                    <input
                      type="checkbox"
                      checked={tools.includes(t)}
                      onChange={() => toggleTool(t)}
                    />{' '}
                    {t}
                  </label>
                </li>
              ))}
            </ul>
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
