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
          ➕
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
                <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.419a4 4 0 0 0-.885 1.343Z" />
                </svg>
              </button>
              <button title="Duplicate" onClick={() => dup(name)}>
                <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h2.5A2.25 2.25 0 0 0 9 6.75v-2.5A2.25 2.25 0 0 0 6.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 2 13.25v2.5A2.25 2.25 0 0 0 4.25 18h2.5A2.25 2.25 0 0 0 9 15.75v-2.5A2.25 2.25 0 0 0 6.75 11h-2.5Zm9-9A2.25 2.25 0 0 0 11 4.25v2.5A2.25 2.25 0 0 0 13.25 9h2.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 11 13.25v2.5A2.25 2.25 0 0 0 13.25 18h2.5A2.25 2.25 0 0 0 18 15.75v-2.5A2.25 2.25 0 0 0 15.75 11h-2.5Z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                className="delete"
                title="Delete"
                onClick={() => del(name)}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                </svg>
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
