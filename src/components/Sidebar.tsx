import clsx from 'clsx';

export default function Sidebar({ current, onNavigate }: {
  current: 'workflows' | 'settings' | 'tools' | 'assistants' | 'chat';
  onNavigate: (
    page: 'workflows' | 'settings' | 'tools' | 'assistants' | 'chat'
  ) => void;
}) {
  return (
    <nav className="sidebar">
      <div className="logo">Logo</div>
      <button
        className={clsx({ active: current === 'workflows' })}
        onClick={() => onNavigate('workflows')}
      >
        Agents
      </button>
      <button
        className={clsx({ active: current === 'assistants' })}
        onClick={() => onNavigate('assistants')}
      >
        Assistants
      </button>
      <button
        className={clsx({ active: current === 'chat' })}
        onClick={() => onNavigate('chat')}
      >
        Chat
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
