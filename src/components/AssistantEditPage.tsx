import { useEffect, useState } from 'react';
import * as api from '../api';

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
    (async () => {
      const data = await api.getAssistant(orig);
      if (data) {
        setName(data.name || orig);
        setSystem(data.system || '');
        setModel(data.model || '');
        setTools(data.tools || []);
      } else {
        setName(orig);
        setSystem('');
        setModel('');
        setTools([]);
      }
      const list = await api.listTools();
      setAvailable(list);
    })();
  }, [orig]);

  const removeTool = (t: string) => {
    setTools(ts => ts.filter(x => x !== t));
  };

  const save = async () => {
    const names = await api.listAssistants();
    let target = orig;
    if (name && name !== orig) {
      if (names.includes(name)) {
        alert('Name already exists');
        return;
      }
      await api.deleteAssistant(orig);
      target = name;
    }
    const payload: AssistantData = { name: target, system, model, tools };
    await api.saveAssistant(target, payload);
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
      <div className="assistant-main">
        <label className="field-label">
          Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
          <label className="field-label">
            System Message
            <textarea
              rows={6}
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
              <select
                defaultValue=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !tools.includes(val)) {
                    setTools((ts) => [...ts, val]);
                  }
                  e.target.value = '';
                }}
              >
                <option value="">Select tool...</option>
                {available
                  .filter((t) => !tools.includes(t))
                  .map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="modal-buttons">
            <button onClick={onBack}>Cancel</button>
            <button onClick={save}>Save</button>
          </div>
      </div>
    </main>
  );
}
