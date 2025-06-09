import NodePalette from './NodePalette';
import EditorCanvas from './EditorCanvas';
import PropertiesPanel from './PropertiesPanel';
import WorkflowManager from './WorkflowManager';

export default function EditorPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="main editor-main">
      <WorkflowManager onBack={onBack} />
      <NodePalette />
      <EditorCanvas />
      <PropertiesPanel />
    </div>
  );
}
