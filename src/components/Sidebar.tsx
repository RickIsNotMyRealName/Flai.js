import clsx from 'clsx';

export default function Sidebar({ current, onNavigate }: {
  current: 'workflows' | 'editor';
  onNavigate: (page: 'workflows' | 'editor') => void;
}) {
  return (
    <nav className="sidebar">
      <button
        className={clsx({ active: current === 'workflows' })}
        onClick={() => onNavigate('workflows')}
      >
        Workflows
      </button>
    </nav>
  );
}
