import { useState } from 'react';
import { useWorkflowStore } from '../store/workflowStore';

export default function EditorHeader({ onBack }: { onBack: () => void }) {
  const name = useWorkflowStore(s => s.workflowName);
  const dirty = useWorkflowStore(s => s.dirty);
  const rename = useWorkflowStore(s => s.renameWorkflow);

  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(name);

  const startEdit = () => {
    setNewName(name);
    setEditing(true);
  };

  const save = () => {
    if (newName && newName !== name) {
      rename(name, newName);
    }
    setEditing(false);
  };

  return (
    <>
      <div className="page-header editor-header">
        <button className="back" onClick={onBack}>Back</button>
        <h2>
          {name}
          {dirty && <span className="unsaved">*</span>}
        </h2>
        <button className="edit" onClick={startEdit}>Edit</button>
      </div>
      {editing && (
        <>
          <div className="modal-backdrop" onClick={() => setEditing(false)} />
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Rename Workflow</h3>
            <input value={newName} onChange={e => setNewName(e.target.value)} />
            <div className="modal-buttons">
              <button onClick={() => setEditing(false)}>Cancel</button>
              <button onClick={save}>Save</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
