import NodePalette from './NodePalette';
import EditorCanvas from './EditorCanvas';
import PropertiesPanel from './PropertiesPanel';
import WorkflowManager from './WorkflowManager';
import EditorHeader from './EditorHeader';

export default function EditorPage({ onBack }: { onBack: () => void }) {
  return (
    <main className="main editor-page">
      <EditorHeader onBack={onBack} />
      <div className="editor-main">
        <WorkflowManager />
        <NodePalette />
        <EditorCanvas />
        <PropertiesPanel />
      </div>
    </main>
  );
}
