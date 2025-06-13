import { useState, useEffect } from 'react';

export default function AssistantsPage({ onOpen }: { onOpen: (name: string) => void }) {
  const [assistants, setAssistants] = useState<string[]>([]);
  const [query, setQuery] = useState('');

  const refresh = () => {
    const list = localStorage.getItem('assistants');
    setAssistants(list ? JSON.parse(list) : []);
  };

  useEffect(() => {
    refresh();
  }, []);


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
    onOpen(name);
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
          <li key={name} className="workflow-item" onClick={() => onOpen(name)}>
            <span className="workflow-name">{name}</span>
            <div className="item-actions" onClick={(e) => e.stopPropagation()}>
              <button
                className="delete"
                title="Delete"
                onClick={() => deleteAssistant(name)}
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
