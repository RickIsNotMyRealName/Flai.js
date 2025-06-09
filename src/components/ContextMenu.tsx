import { useWorkflowStore } from '../store/workflowStore';

export default function ContextMenu() {
  const menu = useWorkflowStore((s) => s.contextMenu);
  const setMenu = useWorkflowStore((s) => s.openContextMenu);
  const removeNode = useWorkflowStore((s) => s.removeNode);
  const duplicateNode = useWorkflowStore((s) => s.duplicateNode);
  const removeEdge = useWorkflowStore((s) => s.removeEdge);

  if (!menu) return null;

  const onDelete = () => {
    if (menu.type === 'node') {
      removeNode(menu.id);
    } else {
      removeEdge(menu.id);
    }
    setMenu(null);
  };

  const onDuplicate = () => {
    if (menu.type === 'node') {
      duplicateNode(menu.id);
    }
    setMenu(null);
  };

  return (
    <ul
      className="context-menu"
      style={{ position: 'absolute', top: menu.position.y, left: menu.position.x, zIndex: 20 }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {menu.type === 'node' && <li onClick={onDuplicate}>Duplicate Node</li>}
      <li onClick={onDelete}>Delete {menu.type === 'node' ? 'Node' : 'Connection'}</li>
    </ul>
  );
}
