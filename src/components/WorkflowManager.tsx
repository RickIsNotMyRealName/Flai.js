import { useEffect, useState } from 'react';
import { useWorkflowStore } from '../store/workflowStore';

export default function WorkflowManager() {
  const names = useWorkflowStore((s) => s.savedWorkflows);
  const refresh = useWorkflowStore((s) => s.refreshSavedWorkflows);
  const save = useWorkflowStore((s) => s.saveWorkflow);
  const load = useWorkflowStore((s) => s.loadWorkflow);
  const remove = useWorkflowStore((s) => s.deleteWorkflow);
  const current = useWorkflowStore((s) => s.workflowName);
  const dirty = useWorkflowStore((s) => s.dirty);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const setToast = useWorkflowStore((s) => s.setToast);

  const [showSave, setShowSave] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [nameInput, setNameInput] = useState(current);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (current && dirty) {
      try {
        save(current);
      } catch {
        setToast('Auto-save failed');
      }
    }
  }, [nodes, edges, current, dirty, save, setToast]);

  const handleSaveAs = () => {
    setNameInput(current);
    setShowSave(true);
  };

  const handleDelete = () => {
    if (current) {
      setShowDelete(true);
    }
  };

  return (
    <>
      <div className="workflow-bar">
        <select value={current} onChange={(e) => load(e.target.value)}>
          {names.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <button onClick={handleSaveAs}>Save As</button>
        <button className="delete" onClick={handleDelete}>Delete</button>
        {dirty && <span className="unsaved">*</span>}
      </div>

      {showSave && (
        <>
          <div className="modal-backdrop" onClick={() => setShowSave(false)} />
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Name Workflow</h3>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={() => setShowSave(false)}>Cancel</button>
              <button
                onClick={() => {
                  save(nameInput);
                  setShowSave(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}

      {showDelete && (
        <>
          <div className="modal-backdrop" onClick={() => setShowDelete(false)} />
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p>Delete workflow "{current}"?</p>
            <div className="modal-buttons">
              <button onClick={() => setShowDelete(false)}>Cancel</button>
              <button
                className="delete"
                onClick={() => {
                  remove(current);
                  setShowDelete(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
