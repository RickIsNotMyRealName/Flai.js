import { useEffect, useState } from 'react';
import { useWorkflowStore } from '../store/workflowStore';

export default function WorkflowManager() {
  const names = useWorkflowStore((s) => s.savedWorkflows);
  const refresh = useWorkflowStore((s) => s.refreshSavedWorkflows);
  const save = useWorkflowStore((s) => s.saveWorkflow);
  const load = useWorkflowStore((s) => s.loadWorkflow);
  const current = useWorkflowStore((s) => s.workflowName);
  const dirty = useWorkflowStore((s) => s.dirty);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const setToast = useWorkflowStore((s) => s.setToast);

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
    const name = prompt('Workflow name', current);
    if (name) save(name);
  };

  return (
    <div className="workflow-bar">
      <select
        value={current}
        onChange={(e) => load(e.target.value)}
      >
        {names.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <button onClick={handleSaveAs}>Save As</button>
      {dirty && <span className="unsaved">*</span>}
    </div>
  );
}
