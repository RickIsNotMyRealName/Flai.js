import NodePalette from './NodePalette';
import EditorCanvas from './EditorCanvas';
import PropertiesPanel from './PropertiesPanel';
import WorkflowManager from './WorkflowManager';
import EditorHeader from './EditorHeader';
import { useWorkflowStore } from '../store/workflowStore';
import { useEffect } from 'react';

export default function EditorPage({ onBack }: { onBack: () => void }) {
  const name = useWorkflowStore(s => s.workflowName);
  const undo = useWorkflowStore(s => s.undo);
  const redo = useWorkflowStore(s => s.redo);
  const editor: 'agent' | 'tool' = name.startsWith('tool:') ? 'tool' : 'agent';

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);
  return (
    <main className="main editor-page">
      <EditorHeader onBack={onBack} />
      <div className="editor-main">
        <WorkflowManager />
        <NodePalette editor={editor} />
        <EditorCanvas />
        <PropertiesPanel />
      </div>
    </main>
  );
}
