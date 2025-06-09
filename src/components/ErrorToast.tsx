import { useWorkflowStore } from '../store/workflowStore';

export default function ErrorToast() {
  const msg = useWorkflowStore((s) => s.lastError);
  if (!msg) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#ff5555',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: 4,
        fontSize: 14,
        zIndex: 1000
      }}
    >
      {msg}
    </div>
  );
}
