import clsx from 'clsx';

export default function Sidebar({ current, onNavigate }: {
  current: 'workflows' | 'settings' | 'tools';
  onNavigate: (page: 'workflows' | 'settings' | 'tools') => void;
}) {
  return (
    <nav className="sidebar">
      <div className="logo">Logo</div>
      <button
        className={clsx({ active: current === 'workflows' })}
        onClick={() => onNavigate('workflows')}
      >
        Workflows
      </button>
      <button
        className={clsx({ active: current === 'tools' })}
        onClick={() => onNavigate('tools')}
      >
        Tools
      </button>
      <button
        className={clsx({ active: current === 'settings' })}
        onClick={() => onNavigate('settings')}
      >
        Settings
      </button>
    </nav>
  );
}
