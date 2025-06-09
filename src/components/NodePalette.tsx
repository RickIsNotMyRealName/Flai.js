import { useMemo, useState } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import type { NodeType } from '../types';
import { validateWorkflow } from '../logic/pinValidation';
import { clsx } from 'clsx';

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
    <aside className="palette">
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
  );
}
