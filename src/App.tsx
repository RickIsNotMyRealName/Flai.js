import { useEffect, useState } from 'react';
import { useWorkflowStore } from './store/workflowStore';
import ErrorToast from './components/ErrorToast';
import Sidebar from './components/Sidebar';
import WorkflowList from './components/WorkflowList';
import EditorPage from './components/EditorPage';
import SettingsPage from './components/SettingsPage';
import ToolsPage from './components/ToolsPage';
import AssistantsPage from './components/AssistantsPage';
import ChatPage from './components/ChatPage';
import clsx from 'clsx';

export default function App() {
  const theme = useWorkflowStore((s) => s.theme);
  const loadDefs = useWorkflowStore((s) => s.loadDefinitions);
  const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow);
  const loadTool = useWorkflowStore((s) => s.loadTool);
  const createWorkflow = useWorkflowStore((s) => s.createWorkflow);
  const refreshTools = useWorkflowStore(s => s.refreshToolNodes);

  const [page, setPage] = useState<
    'workflows' | 'editor' | 'settings' | 'tools' | 'assistants' | 'chat'
  >('workflows');
  const [returnPage, setReturnPage] = useState<'workflows' | 'tools'>('workflows');
  const [chatBack, setChatBack] = useState<
    'workflows' | 'settings' | 'tools' | 'assistants'
  >('workflows');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}nodeTypes.json`)
      .then((r) => r.json())
      .then((json) => {
        loadDefs(json);
        refreshTools();
      })
      .catch((err) => console.error('Failed to load node types', err));
  }, [loadDefs, refreshTools]);

  const openWorkflow = (name: string) => {
    loadWorkflow(name);
    setReturnPage('workflows');
    setPage('editor');
  };

  const openTool = (name: string) => {
    loadTool(name);
    setReturnPage('tools');
    setPage('editor');
  };

  const createAndOpen = () => {
    createWorkflow();
    setReturnPage('workflows');
    setPage('editor');
  };

  return (
    <div className={clsx('app-container', theme)}>
      {page !== 'editor' && page !== 'chat' && (
        <Sidebar
          current={page as
            | 'workflows'
            | 'settings'
            | 'tools'
            | 'assistants'
            | 'chat'}
          onNavigate={(p) => {
            if (p === 'chat') {
              setChatBack(
                page as 'workflows' | 'settings' | 'tools' | 'assistants'
              );
            }
            setPage(p);
          }}
        />
      )}

      {page === 'workflows' && (
        <main className="main">
          <WorkflowList onOpen={openWorkflow} onCreate={createAndOpen} />
        </main>
      )}

      {page === 'assistants' && <AssistantsPage />}
      {page === 'chat' && <ChatPage onBack={() => setPage(chatBack)} />}

      {page === 'settings' && <SettingsPage />}
      {page === 'tools' && <ToolsPage onOpen={openTool} />}

      {page === 'editor' && (
        <EditorPage onBack={() => setPage(returnPage)} />
      )}

      <ErrorToast />
    </div>
  );
}
