import { useWorkflowStore } from '../store/workflowStore';

export default function ErrorToast() {
  const toast = useWorkflowStore((s) => s.toast);
  if (!toast) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: toast.type === 'success' ? '#55aa55' : '#ff5555',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: 4,
        fontSize: 14,
        zIndex: 1000
      }}
    >
      {toast.message}
    </div>
  );
}
