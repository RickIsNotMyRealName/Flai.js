import NodePalette from './NodePalette';
import EditorCanvas from './EditorCanvas';
import PropertiesPanel from './PropertiesPanel';
import WorkflowManager from './WorkflowManager';
import EditorHeader from './EditorHeader';

export default function EditorPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="main editor-main">
      <EditorHeader onBack={onBack} />
      <WorkflowManager />
      <NodePalette />
      <EditorCanvas />
      <PropertiesPanel />
    </div>
  );
}
