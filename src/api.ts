const prefix = '/api/v1';

export async function getNodeTypes() {
  const res = await fetch(`${prefix}/nodeTypes`);
  return res.json();
}

// workflows
export async function listWorkflows(): Promise<string[]> {
  const res = await fetch(`${prefix}/workflows`);
  return res.json();
}

export async function getWorkflow(name: string) {
  const res = await fetch(`${prefix}/workflows/${encodeURIComponent(name)}`);
  return res.json();
}

export async function saveWorkflow(name: string, data: unknown) {
  await fetch(`${prefix}/workflows/${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function deleteWorkflow(name: string) {
  await fetch(`${prefix}/workflows/${encodeURIComponent(name)}`, { method: 'DELETE' });
}

// tools
export async function listTools(): Promise<string[]> {
  const res = await fetch(`${prefix}/tools`);
  return res.json();
}

export async function getTool(name: string) {
  const res = await fetch(`${prefix}/tools/${encodeURIComponent(name)}`);
  return res.json();
}

export async function saveTool(name: string, data: unknown) {
  await fetch(`${prefix}/tools/${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function deleteTool(name: string) {
  await fetch(`${prefix}/tools/${encodeURIComponent(name)}`, { method: 'DELETE' });
}

// assistants
export async function listAssistants(): Promise<string[]> {
  const res = await fetch(`${prefix}/assistants`);
  return res.json();
}

export async function getAssistant(name: string) {
  const res = await fetch(`${prefix}/assistants/${encodeURIComponent(name)}`);
  return res.json();
}

export async function saveAssistant(name: string, data: unknown) {
  await fetch(`${prefix}/assistants/${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function deleteAssistant(name: string) {
  await fetch(`${prefix}/assistants/${encodeURIComponent(name)}`, { method: 'DELETE' });
}

// chats
export async function getChats() {
  const res = await fetch(`${prefix}/chats`);
  return res.json();
}

export async function saveChats(data: unknown) {
  await fetch(`${prefix}/chats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

// settings
export async function getSettings() {
  const res = await fetch(`${prefix}/settings`);
  return res.json();
}

export async function saveSettings(data: unknown) {
  await fetch(`${prefix}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}
