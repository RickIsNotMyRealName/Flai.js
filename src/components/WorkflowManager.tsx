import { useEffect } from 'react';
import { useWorkflowStore } from '../store/workflowStore';

export default function WorkflowManager() {
  const saveWorkflow = useWorkflowStore((s) => s.saveWorkflow);
  const saveTool = useWorkflowStore((s) => s.saveTool);
  const current = useWorkflowStore((s) => s.workflowName);
  const dirty = useWorkflowStore((s) => s.dirty);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const setToast = useWorkflowStore((s) => s.setToast);

  useEffect(() => {
    if (current && dirty) {
      try {
        if (current.startsWith('tool:')) {
          saveTool(current.slice(5));
        } else {
          saveWorkflow(current);
        }
      } catch {
        setToast('Auto-save failed');
      }
    }
  }, [nodes, edges, current, dirty, saveWorkflow, saveTool, setToast]);

  /* Save actions are handled automatically via auto-save */

  return null;
}
