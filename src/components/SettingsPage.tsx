import { useWorkflowStore } from '../store/workflowStore';

export default function SettingsPage() {
  const theme = useWorkflowStore(s => s.theme);
  const setTheme = useWorkflowStore(s => s.setTheme);

  const toggle = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <main className="main">
      <div className="page-header">
        <h2>Settings</h2>
      </div>
      <label className="field-label">
        Dark Mode
        <span className="switch">
          <input type="checkbox" checked={theme === 'dark'} onChange={toggle} />
          <span className="slider" />
        </span>
      </label>
    </main>
  );
}
