import NodePalette from './NodePalette';
import EditorCanvas from './EditorCanvas';
import PropertiesPanel from './PropertiesPanel';
import WorkflowManager from './WorkflowManager';

export default function EditorPage() {
  return (
    <div className="main editor-main">
      <WorkflowManager />
      <NodePalette />
      <EditorCanvas />
      <PropertiesPanel />
    </div>
  );
}
