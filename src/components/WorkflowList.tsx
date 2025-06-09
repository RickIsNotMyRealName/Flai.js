import { useEffect, useState } from 'react';
import { useWorkflowStore } from '../store/workflowStore';

export default function WorkflowList({ onOpen }:{ onOpen:(name:string)=>void }) {
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
      <h2>Workflows</h2>
      <ul>
        {names.map(name => (
          <li key={name} className="workflow-item">
            <button className="open" onClick={() => onOpen(name)}>{name}</button>
            <div className="item-actions">
              <button onClick={() => { setRenaming(name); setNewName(name); }}>Rename</button>
              <button onClick={() => dup(name)}>Duplicate</button>
              <button className="delete" onClick={() => del(name)}>Delete</button>
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
