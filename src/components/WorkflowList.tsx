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

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <div className="workflow-list">
      <div className="list-header">
        <h2>Workflows</h2>
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
        </button>
      </div>
      <ul>
        {names.map((name) => (
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
