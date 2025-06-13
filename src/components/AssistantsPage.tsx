import { useState, useEffect } from 'react';

interface AssistantData {
  name: string;
  instructions: string;
}

export default function AssistantsPage() {
  const [assistants, setAssistants] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [metaName, setMetaName] = useState('');
  const [metaInstr, setMetaInstr] = useState('');

  const refresh = () => {
    const list = localStorage.getItem('assistants');
    setAssistants(list ? JSON.parse(list) : []);
  };

  useEffect(() => {
    refresh();
  }, []);

  const openEdit = (name: string) => {
    const raw = localStorage.getItem(`assistant.${name}`);
    let data: AssistantData = { name, instructions: '' };
    if (raw) {
      try {
        data = JSON.parse(raw) as AssistantData;
      } catch {
        /* ignore parse errors */
      }
    }
    setMetaName(data.name);
    setMetaInstr(data.instructions || '');
    setEditing(name);
  };

  const saveAssistant = () => {
    if (!editing) return;
    const listRaw = localStorage.getItem('assistants');
    const names: string[] = listRaw ? JSON.parse(listRaw) : [];
    let target = editing;
    if (metaName && metaName !== editing) {
      if (names.includes(metaName)) {
        alert('Name already exists');
        return;
      }
      const idx = names.indexOf(editing);
      if (idx !== -1) names[idx] = metaName;
      localStorage.removeItem(`assistant.${editing}`);
      target = metaName;
    }
    localStorage.setItem('assistants', JSON.stringify(names));
    localStorage.setItem(
      `assistant.${target}`,
      JSON.stringify({ name: metaName, instructions: metaInstr })
    );
    setEditing(null);
    refresh();
  };

  const deleteAssistant = (name: string) => {
    const listRaw = localStorage.getItem('assistants');
    const names: string[] = listRaw ? JSON.parse(listRaw) : [];
    const idx = names.indexOf(name);
    if (idx !== -1) names.splice(idx, 1);
    localStorage.setItem('assistants', JSON.stringify(names));
    localStorage.removeItem(`assistant.${name}`);
    setAssistants(names);
  };

  const createAssistant = () => {
    const list = assistants.slice();
    let base = 'Untitled Assistant';
    let idx = 1;
    let name = `${base} ${idx}`;
    while (list.includes(name)) name = `${base} ${++idx}`;
    localStorage.setItem(
      `assistant.${name}`,
      JSON.stringify({ name, instructions: '' })
    );
    list.push(name);
    localStorage.setItem('assistants', JSON.stringify(list));
    setAssistants(list);
    openEdit(name);
  };

  const filtered = assistants.filter((n) =>
    n.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="main">
      <div className="page-header">
        <h2>Assistants</h2>
      </div>
      <div className="workflow-controls">
        <div className="search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="16" y1="16" x2="22" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            className="workflow-search"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button className="create-btn" title="New Assistant" onClick={createAssistant}>
          <svg width="16" height="16" viewBox="0 0 12 12" aria-hidden="true">
            <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="create-label">New</span>
        </button>
      </div>
      <ul>
        {filtered.map((name) => (
          <li key={name} className="workflow-item">
            <span className="workflow-name">{name}</span>
            <div className="item-actions">
              <button title="Edit" onClick={() => openEdit(name)}>✏️</button>
              <button className="delete" title="Delete" onClick={() => deleteAssistant(name)}>
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
      {editing && (
        <>
          <div className="modal-backdrop" onClick={() => setEditing(null)} />
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Assistant</h3>
            <label className="field-label">
              Name
              <input type="text" value={metaName} onChange={(e) => setMetaName(e.target.value)} />
            </label>
            <label className="field-label">
              Instructions
              <textarea
                value={metaInstr}
                onChange={(e) => setMetaInstr(e.target.value)}
                rows={4}
              />
            </label>
            <div className="modal-buttons">
              <button onClick={() => setEditing(null)}>Cancel</button>
              <button onClick={saveAssistant}>Save</button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
