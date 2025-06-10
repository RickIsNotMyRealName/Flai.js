import { useEffect, useState } from 'react';
import { useWorkflowStore } from '../store/workflowStore';

export default function WorkflowList({
  onOpen,
  onCreate,
}: {
  onOpen: (name: string) => void;
  onCreate: () => void;
}) {
  const names = useWorkflowStore(s => s.savedWorkflows);
  const refresh = useWorkflowStore(s => s.refreshSavedWorkflows);
  const del = useWorkflowStore(s => s.deleteWorkflow);
  const dup = useWorkflowStore(s => s.duplicateWorkflow);
  const rename = useWorkflowStore(s => s.renameWorkflow);

  const [renaming, setRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = names.filter(n =>
    n.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="workflow-list">
      <div className="list-header page-header">
        <h2>Workflows</h2>
      </div>
      <div className="workflow-controls">
        <div className="search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <line
              x1="16"
              y1="16"
              x2="22"
              y2="22"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            className="workflow-search"
            placeholder="Search workflows"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <button
          className="create-btn"
          title="New Workflow"
          onClick={onCreate}
        >
          <svg width="16" height="16" viewBox="0 0 12 12" aria-hidden="true">
            <line
              x1="1"
              y1="6"
              x2="11"
              y2="6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="6"
              y1="1"
              x2="6"
              y2="11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="create-label">New</span>
        </button>
      </div>
      <ul>
        {filtered.map((name) => (
          <li
            key={name}
            className="workflow-item"
            onClick={() => onOpen(name)}
          >
            <span className="workflow-name">{name}</span>
            <div className="item-actions" onClick={(e) => e.stopPropagation()}>
              <button
                title="Rename"
                onClick={() => {
                  setRenaming(name);
                  setNewName(name);
                }}
              >
                ✏️
              </button>
              <button title="Duplicate" onClick={() => dup(name)}>⧉</button>
              <button
                className="delete"
                title="Delete"
                onClick={() => del(name)}
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>

      {renaming && (
        <>
          <div className="modal-backdrop" onClick={() => setRenaming(null)} />
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Rename Workflow</h3>
            <input value={newName} onChange={e => setNewName(e.target.value)} />
            <div className="modal-buttons">
              <button onClick={() => setRenaming(null)}>Cancel</button>
              <button onClick={() => { rename(renaming, newName); setRenaming(null); }}>Save</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
