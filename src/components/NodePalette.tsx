import { useMemo, useState } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import { validateWorkflow } from '../logic/pinValidation';

interface Props {
  editor: 'agent' | 'tool';
}
export default function NodePalette({ editor }: Props) {
  const nodeTypes = useWorkflowStore((s) => s.nodeTypes);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const hierarchy = useWorkflowStore((s) => s.typeHierarchy);
  const setToast = useWorkflowStore((s) => s.setToast);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return nodeTypes.filter(
      (nt) =>
        (!nt.editors || nt.editors.includes(editor)) &&
        (nt.name.toLowerCase().includes(q) ||
          nt.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [nodeTypes, query, editor]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach((nt) => {
      const cat = nt.category || 'Other';
      if (!map.has(cat)) map.set(cat, [] as typeof filtered);
      map.get(cat)!.push(nt);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <div className="palette-wrapper">
      <button
        type="button"
        className="palette-toggle"
        aria-label={open ? 'Close node list' : 'Add node'}
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <svg width="16" height="16" viewBox="0 0 12 12" aria-hidden="true">
            <line
              x1="1"
              y1="1"
              x2="11"
              y2="11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="11"
              y1="1"
              x2="1"
              y2="11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 12 12" aria-hidden="true">
            <line
              x1="1"
              y1="6"
              x2="11"
              y2="6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="6"
              y1="1"
              x2="6"
              y2="11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
      <button
        type="button"
        className="palette-toggle validate-toggle"
        aria-label="Validate workflow"
        onClick={() => {
          const err = validateWorkflow(
            nodes,
            edges,
            nodeTypes,
            hierarchy,
            editor === 'tool' ? 'tool' : 'agent'
          );
          if (err) {
            setToast(err, 'error');
          } else {
            setToast('Workflow valid', 'success');
          }
        }}
      >
        <svg width="16" height="16" viewBox="0 0 12 12" aria-hidden="true">
          <polyline
            points="1 7 5 11 11 1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <aside className="palette palette-floating">
          <input
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ul className="palette-list">
            {grouped.map(([cat, nts]) => (
              <li key={cat} className="palette-category">
                <button
                  type="button"
                  className="category-header"
                  onClick={() =>
                    setCollapsed((c) => ({ ...c, [cat]: !c[cat] }))
                  }
                >
                  <span className="arrow">{collapsed[cat] ? '▶' : '▼'}</span>
                  {cat}
                </button>
                {!collapsed[cat] && (
                  <ul className="category-items">
                    {nts.map((nt) => (
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
                )}
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
