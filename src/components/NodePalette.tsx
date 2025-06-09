import { useMemo, useState } from 'react';
import { useWorkflowStore } from '../store/workflowStore';

export default function NodePalette() {
  const nodeTypes = useWorkflowStore((s) => s.nodeTypes);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return nodeTypes.filter(
      (nt) =>
        nt.name.toLowerCase().includes(q) ||
        nt.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [nodeTypes, query]);

  return (
    <div className="palette-wrapper">
      <button className="palette-toggle" onClick={() => setOpen(!open)}>
        {open ? '✕' : 'Nodes'}
      </button>
      {open && (
        <aside className="palette palette-floating">
          <input
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ul>
            {filtered.map((nt) => (
              <li
                key={nt.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/x-node-type', nt.id);
                }}
              >
                {nt.icon && <img src={nt.icon} alt="" />}
                {nt.name}
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
