import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import type { NodeInstance, EdgeInstance, ToolData, ToolMeta } from '../types';


export default function ToolsPage({ onOpen }: { onOpen: (name: string) => void }) {
  const [tools, setTools] = useState<string[]>([]);
  const [query, setQuery] = useState('');

  const [editing, setEditing] = useState<string | null>(null);
  const [metaName, setMetaName] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [metaSchema, setMetaSchema] = useState('');
  const [data, setData] = useState<ToolData | null>(null);

  const refresh = () => {
    const list = localStorage.getItem('tools');
    setTools(list ? JSON.parse(list) : []);
  };

  useEffect(() => {
    refresh();
  }, []);

  const openEdit = (name: string) => {
    const raw = localStorage.getItem(`tool.${name}`);
    let parsed: ToolData;
    if (raw) {
      try {
        parsed = JSON.parse(raw) as ToolData;
      } catch {
        parsed = { meta: { name, description: '', schema: '' }, nodes: {}, edges: [] };
      }
    } else {
      parsed = { meta: { name, description: '', schema: '' }, nodes: {}, edges: [] };
    }

    let start = Object.values(parsed.nodes).find((n) => n.nodeTypeId === 'tool.start');
    if (!start) {
      const id = uuid();
      start = {
        uuid: id,
        nodeTypeId: 'tool.start',
        position: { x: 0, y: 0 },
        fields: {},
      };
      parsed.nodes[id] = start;
    }

    if (!Object.values(parsed.nodes).some((n) => n.nodeTypeId === 'tool.end')) {
      const id = uuid();
      parsed.nodes[id] = {
        uuid: id,
        nodeTypeId: 'tool.end',
        position: { x: 200, y: 0 },
        fields: {},
      };
    }

    setMetaName(parsed.meta?.name || name);
    setMetaDesc(parsed.meta?.description || '');
    setMetaSchema(parsed.meta?.schema || '');
    setEditing(name);
    setData(parsed);
  };

  const createTool = () => {
    const list = tools.slice();
    let base = 'Untitled Tool';
    let idx = 1;
    let name = `${base} ${idx}`;
    while (list.includes(name)) {
      name = `${base} ${++idx}`;
    }

    const startId = uuid();
    const endId = uuid();
    const start: NodeInstance = {
      uuid: startId,
      nodeTypeId: 'tool.start',
      position: { x: 0, y: 0 },
      fields: {},
    };
    const end: NodeInstance = {
      uuid: endId,
      nodeTypeId: 'tool.end',
      position: { x: 200, y: 0 },
      fields: {},
    };
    const newData: ToolData = {
      meta: { name: '', description: '', schema: '' },
      nodes: { [startId]: start, [endId]: end },
      edges: [],
    };
    localStorage.setItem(`tool.${name}`, JSON.stringify(newData));
    list.push(name);
    localStorage.setItem('tools', JSON.stringify(list));
    setTools(list);
    openEdit(name);
  };

  const saveTool = () => {
    if (!editing || !data) return;
    const list = localStorage.getItem('tools');
    const names: string[] = list ? JSON.parse(list) : [];

    data.meta = { name: metaName, description: metaDesc, schema: metaSchema };

    let target = editing;
    if (metaName && metaName !== editing) {
      if (names.includes(metaName)) {
        alert('Name already exists');
        return;
      }
      target = metaName;
      const idx = names.indexOf(editing);
      if (idx !== -1) names[idx] = metaName;
      localStorage.removeItem(`tool.${editing}`);
    }
    localStorage.setItem('tools', JSON.stringify(names));
    localStorage.setItem(`tool.${target}`, JSON.stringify(data));
    setEditing(null);
    setData(null);
    refresh();
  };

  const deleteTool = (name: string) => {
    const list = localStorage.getItem('tools');
    const names: string[] = list ? JSON.parse(list) : [];
    const idx = names.indexOf(name);
    if (idx !== -1) names.splice(idx, 1);
    localStorage.setItem('tools', JSON.stringify(names));
    localStorage.removeItem(`tool.${name}`);
    setTools(names);
  };

  const filtered = tools.filter(t => t.toLowerCase().includes(query.toLowerCase()));

  return (
    <main className="main">
      <div className="page-header">
        <h2>Tools</h2>
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
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <button className="create-btn" title="New Tool" onClick={createTool}>
          <svg width="16" height="16" viewBox="0 0 12 12" aria-hidden="true">
            <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="create-label">New</span>
        </button>
      </div>
      <ul>
        {filtered.map(name => (
          <li
            key={name}
            className="workflow-item"
            onClick={() => onOpen(name)}
          >
            <span className="workflow-name">{name}</span>
            <div className="item-actions" onClick={e => e.stopPropagation()}>
              <button title="Edit" onClick={() => openEdit(name)}>✏️</button>
              <button className="delete" title="Delete" onClick={() => deleteTool(name)}>
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <>
          <div className="modal-backdrop" onClick={() => setEditing(null)} />
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Edit Tool</h3>
            <label className="field-label">
              Name
              <input type="text" value={metaName} onChange={e => setMetaName(e.target.value)} />
            </label>
            <label className="field-label">
              Description
              <input type="text" value={metaDesc} onChange={e => setMetaDesc(e.target.value)} />
            </label>
            <label className="field-label">
              JSON Schema
              <input type="text" value={metaSchema} onChange={e => setMetaSchema(e.target.value)} />
            </label>
            <div className="modal-buttons">
              <button onClick={() => setEditing(null)}>Cancel</button>
              <button onClick={saveTool}>Save</button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
