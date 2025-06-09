import { useEffect, useState } from 'react';
import { useWorkflowStore } from './store/workflowStore';
import ErrorToast from './components/ErrorToast';
import Sidebar from './components/Sidebar';
import WorkflowList from './components/WorkflowList';
import EditorPage from './components/EditorPage';
import clsx from 'clsx';

export default function App() {
  const theme = useWorkflowStore((s) => s.theme);
  const loadDefs = useWorkflowStore((s) => s.loadDefinitions);
  const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow);

  const [page, setPage] = useState<'workflows' | 'editor'>('workflows');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}nodeTypes.json`)
      .then((r) => r.json())
      .then(loadDefs)
      .catch((err) => console.error('Failed to load node types', err));
  }, [loadDefs]);

  const openWorkflow = (name: string) => {
    loadWorkflow(name);
    setPage('editor');
  };

  return (
    <div className={clsx('app-container', theme)}>
      <Sidebar current={page} onNavigate={setPage} />
      {page === 'workflows' ? (
        <main className="main">
          <WorkflowList onOpen={openWorkflow} />
        </main>
      ) : (
        <EditorPage />
      )}
      <ErrorToast />
    </div>
  );
}
