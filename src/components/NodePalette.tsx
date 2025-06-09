import { useMemo, useState } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import { validateWorkflow } from '../logic/pinValidation';

export default function NodePalette() {
  const nodeTypes = useWorkflowStore((s) => s.nodeTypes);
  const addNode = useWorkflowStore((s) => s.addNode);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const hierarchy = useWorkflowStore((s) => s.typeHierarchy);
  const setToast = useWorkflowStore((s) => s.setToast);
  const [query, setQuery] = useState('');

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
      <button
        type="button"
        className="palette-toggle"
        aria-label={open ? 'Close node list' : 'Add node'}
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 12 12"
            aria-hidden="true"
          >
            {nt.icon && <img src={nt.icon} alt="" />}
            {nt.name}
          </li>
        ))}
      </ul>
      <button
        className="validate-btn"
        onClick={() => {
          const err = validateWorkflow(nodes, edges, nodeTypes, hierarchy);
          if (err) {
            setToast(err, 'error');
          } else {
            setToast('Workflow valid', 'success');
          }
        }}
      >
        Validate
      </button>
    </aside>
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
          <svg
            width="16"
            height="16"
            viewBox="0 0 12 12"
            aria-hidden="true"
          >
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
