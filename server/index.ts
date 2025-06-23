import express from 'express';
import { join } from 'path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import type { ToolData, AssistantData, Chat, Settings } from './types.js';

function loadJSON<T>(dir: string, name: string, fallback: T): T {
  const file = join(dir, name);
  if (!existsSync(file)) return fallback;
  try {
    return JSON.parse(readFileSync(file, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

function saveJSON(dir: string, name: string, data: unknown) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, name), JSON.stringify(data, null, 2));
}

export function createServer(opts: { dataDir?: string } = {}) {
  const __dirname = fileURLToPath(new URL('.', import.meta.url));
  const dataDir = opts.dataDir || join(__dirname, 'data');

  const workflows: Record<string, ToolData> = loadJSON(dataDir, 'workflows.json', {});
  const tools: Record<string, ToolData> = loadJSON(dataDir, 'tools.json', {});
  const assistants: Record<string, AssistantData> = loadJSON(dataDir, 'assistants.json', {});
  const chats: Chat[] = loadJSON(dataDir, 'chats.json', []);
  const settings: Settings = loadJSON(dataDir, 'settings.json', { theme: 'light' });

  const app = express();
  app.use(express.json());

  const router = express.Router();

  router.get('/nodeTypes', (_req, res) => {
    res.sendFile(join(__dirname, '../public/nodeTypes.json'));
  });

  // workflows
  router.get('/workflows', (_req, res) => {
    res.json(Object.keys(workflows));
  });

  router.get('/workflows/:name', (req, res) => {
    res.json(workflows[req.params.name] || null);
  });

  router.post('/workflows/:name', (req, res) => {
    workflows[req.params.name] = req.body;
    saveJSON(dataDir, 'workflows.json', workflows);
    res.json({ ok: true });
  });

  router.delete('/workflows/:name', (req, res) => {
    delete workflows[req.params.name];
    saveJSON(dataDir, 'workflows.json', workflows);
    res.json({ ok: true });
  });

  // tools
  router.get('/tools', (_req, res) => {
    res.json(Object.keys(tools));
  });

  router.get('/tools/:name', (req, res) => {
    res.json(tools[req.params.name] || null);
  });

  router.post('/tools/:name', (req, res) => {
    tools[req.params.name] = req.body;
    saveJSON(dataDir, 'tools.json', tools);
    res.json({ ok: true });
  });

  router.delete('/tools/:name', (req, res) => {
    delete tools[req.params.name];
    saveJSON(dataDir, 'tools.json', tools);
    res.json({ ok: true });
  });

  // assistants
  router.get('/assistants', (_req, res) => {
    res.json(Object.keys(assistants));
  });

  router.get('/assistants/:name', (req, res) => {
    res.json(assistants[req.params.name] || null);
  });

  router.post('/assistants/:name', (req, res) => {
    assistants[req.params.name] = req.body;
    saveJSON(dataDir, 'assistants.json', assistants);
    res.json({ ok: true });
  });

  router.delete('/assistants/:name', (req, res) => {
    delete assistants[req.params.name];
    saveJSON(dataDir, 'assistants.json', assistants);
    res.json({ ok: true });
  });

  // chats
  router.get('/chats', (_req, res) => {
    res.json(chats);
  });

  router.post('/chats', (req, res) => {
    chats.length = 0;
    chats.push(...req.body);
    saveJSON(dataDir, 'chats.json', chats);
    res.json({ ok: true });
  });

  // settings
  router.get('/settings', (_req, res) => {
    res.json(settings);
  });

  router.post('/settings', (req, res) => {
    Object.assign(settings, req.body);
    saveJSON(dataDir, 'settings.json', settings);
    res.json({ ok: true });
  });

  app.use('/api/v1', router);

  // TODO: remove these deprecated routes in v2
  app.use('/api', router);

  return { app };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { app } = createServer();
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on ${port}`);
  });
}
