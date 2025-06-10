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
        <h2 className="editor-title">
          {name}
          {dirty && <span className="unsaved">*</span>}
          <button
            className="name-edit-btn"
            title="Rename"
            onClick={startEdit}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 20h9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M16.5 3.5l4 4L7 21H3v-4L16.5 3.5z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </h2>
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
