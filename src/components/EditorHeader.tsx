import { useState } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import SchemaEditor from './SchemaEditor';

export default function EditorHeader({ onBack }: { onBack: () => void }) {
  const name = useWorkflowStore(s => s.workflowName);
  const displayName = name.startsWith('tool:') ? name.slice(5) : name;
  const dirty = useWorkflowStore(s => s.dirty);
  const rename = useWorkflowStore(s => s.renameWorkflow);
  const toolMeta = useWorkflowStore(s => s.toolMeta);
  const setToolMeta = useWorkflowStore(s => s.setToolMeta);
  const renameTool = useWorkflowStore(s => s.renameTool);
  const undo = useWorkflowStore(s => s.undo);
  const redo = useWorkflowStore(s => s.redo);

  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(displayName);
  const [cfgOpen, setCfgOpen] = useState(false);
  const [cfgName, setCfgName] = useState(
    toolMeta?.name || (name.startsWith('tool:') ? name.slice(5) : '')
  );
  const [cfgDesc, setCfgDesc] = useState(toolMeta?.description || '');
  const [cfgSchema, setCfgSchema] = useState(toolMeta?.schema || '');

  const startEdit = () => {
    setNewName(displayName);
    setEditing(true);
  };

  const openCfg = () => {
    setCfgName(toolMeta?.name || (name.startsWith('tool:') ? name.slice(5) : ''));
    setCfgDesc(toolMeta?.description || '');
    setCfgSchema(toolMeta?.schema || '');
    setCfgOpen(true);
  };

  const saveCfg = () => {
    if (name.startsWith('tool:')) {
      const current = toolMeta?.name || name.slice(5);
      let target = current;
      if (cfgName && cfgName !== current) {
        const list = localStorage.getItem('tools');
        const names = list ? JSON.parse(list) : [];
        if (names.includes(cfgName)) {
          alert('Name already exists');
          return;
        }
        renameTool(current, cfgName);
        target = cfgName;
      }
      setToolMeta({ name: target, description: cfgDesc, schema: cfgSchema });
    }
    setCfgOpen(false);
  };

  const save = () => {
    if (newName && newName !== displayName) {
      if (name.startsWith('tool:')) {
        renameTool(name.slice(5), newName);
      } else {
        rename(name, newName);
      }
    }
    setEditing(false);
  };

  return (
    <>
      <div className="page-header editor-header">
        <button className="back-btn" onClick={onBack} aria-label="Back">
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <polyline
              points="15 18 9 12 15 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="history-buttons">
          <button className="undo-btn" onClick={undo} aria-label="Undo">
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <polyline
                points="1 4 1 10 7 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button className="redo-btn" onClick={redo} aria-label="Redo">
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <polyline
                points="23 4 23 10 17 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        {name.startsWith('tool:') && (
          <button className="settings-btn" onClick={openCfg} title="Tool Settings">
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M19.4 15a1 1 0 0 0 .1 1.6l.1.1a1 1 0 0 1 0 1.4l-1.4 1.4a1 1 0 0 1-1.4 0l-.1-.1a1 1 0 0 0-1.6.1 7 7 0 0 1-1.2.7 1 1 0 0 0-.6.9V21a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-.2a1 1 0 0 0-.6-.9 7 7 0 0 1-1.2-.7 1 1 0 0 0-1.6-.1l-.1.1a1 1 0 0 1-1.4 0L4 18.1a1 1 0 0 1 0-1.4l.1-.1a1 1 0 0 0 .1-1.6 7 7 0 0 1-.7-1.2 1 1 0 0 0-.9-.6H3a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h.2a1 1 0 0 0 .9-.6 7 7 0 0 1 .7-1.2 1 1 0 0 0-.1-1.6l-.1-.1a1 1 0 0 1 0-1.4L5.4 4a1 1 0 0 1 1.4 0l.1.1a1 1 0 0 0 1.6-.1 7 7 0 0 1 1.2-.7 1 1 0 0 0 .6-.9V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v.2a1 1 0 0 0 .6.9 7 7 0 0 1 1.2.7 1 1 0 0 0 1.6.1l.1-.1a1 1 0 0 1 1.4 0l1.4 1.4a1 1 0 0 1 0 1.4l-.1.1a1 1 0 0 0 .1 1.6 7 7 0 0 1 .7 1.2 1 1 0 0 0 .9.6H21a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-.2a1 1 0 0 0-.9.6 7 7 0 0 1-.7 1.2z" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        )}
        <h2 className="editor-title">
          {displayName}
          {dirty && <span className="unsaved">*</span>}
          <button
            className="name-edit-btn"
            title="Rename"
            onClick={startEdit}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 20h9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M16.5 3.5l4 4L7 21H3v-4L16.5 3.5z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </h2>
      </div>
      {editing && (
        <>
          <div className="modal-backdrop" onClick={() => setEditing(false)} />
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Rename Workflow</h3>
            <input value={newName} onChange={e => setNewName(e.target.value)} />
            <div className="modal-buttons">
              <button onClick={() => setEditing(false)}>Cancel</button>
              <button onClick={save}>Save</button>
            </div>
          </div>
        </>
      )}
      {cfgOpen && (
        <>
          <div className="modal-backdrop" onClick={() => setCfgOpen(false)} />
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <h3>Tool Settings</h3>
            <label className="field-label">
              Name
              <input type="text" value={cfgName} onChange={e => setCfgName(e.target.value)} />
            </label>
            <label className="field-label">
              Description
              <input type="text" value={cfgDesc} onChange={e => setCfgDesc(e.target.value)} />
            </label>
            <label className="field-label">
              JSON Schema
              <SchemaEditor value={cfgSchema} onChange={setCfgSchema} />
            </label>
            <div className="modal-buttons">
              <button onClick={() => setCfgOpen(false)}>Cancel</button>
              <button onClick={saveCfg}>Save</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
