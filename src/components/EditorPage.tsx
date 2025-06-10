import NodePalette from './NodePalette';
import EditorCanvas from './EditorCanvas';
import PropertiesPanel from './PropertiesPanel';
import WorkflowManager from './WorkflowManager';
import EditorHeader from './EditorHeader';
import { useWorkflowStore } from '../store/workflowStore';

export default function EditorPage({ onBack }: { onBack: () => void }) {
  const name = useWorkflowStore(s => s.workflowName);
  const editor: 'agent' | 'tool' = name.startsWith('tool:') ? 'tool' : 'agent';
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
