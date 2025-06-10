import { useEffect } from 'react';
import { useWorkflowStore } from '../store/workflowStore';

export default function WorkflowManager() {
  const save = useWorkflowStore((s) => s.saveWorkflow);
  const current = useWorkflowStore((s) => s.workflowName);
  const dirty = useWorkflowStore((s) => s.dirty);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const setToast = useWorkflowStore((s) => s.setToast);

  useEffect(() => {
    if (current && dirty) {
      try {
        save(current);
      } catch {
        setToast('Auto-save failed');
      }
    }
  }, [nodes, edges, current, dirty, save, setToast]);

  /* Save actions are handled automatically via auto-save */

  return null;
}
