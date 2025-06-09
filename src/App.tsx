import { useEffect } from 'react';
import { useWorkflowStore } from './store/workflowStore';
import NodePalette from './components/NodePalette';
import EditorCanvas from './components/EditorCanvas';
import PropertiesPanel from './components/PropertiesPanel';
import ErrorToast from './components/ErrorToast';
import clsx from 'clsx';

export default function App() {
  const theme     = useWorkflowStore((s) => s.theme);
  const loadDefs  = useWorkflowStore((s) => s.loadDefinitions);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}nodeTypes.json`)
      .then((r) => r.json())
      .then(loadDefs)
      .catch((err) => console.error('Failed to load node types', err));
  }, []);

  return (
    <div className={clsx('app', theme)}>
      <NodePalette />
      <EditorCanvas />
      <PropertiesPanel />
      <ErrorToast />
    </div>
  );
}
