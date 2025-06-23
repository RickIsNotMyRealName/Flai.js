import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { createServer } from '../index.js';

let dataDir: string;
let app: ReturnType<typeof createServer>["app"];

beforeEach(() => {
  dataDir = mkdtempSync(join(tmpdir(), 'flai-'));
  app = createServer({ dataDir }).app;
});

afterEach(() => {
  rmSync(dataDir, { recursive: true, force: true });
});

describe('workflow routes', () => {
  it('creates, reads and deletes workflows', async () => {
    await request(app)
      .post('/api/v1/workflows/test')
      .send({ nodes: {}, edges: [] })
      .expect(200);

    const list = await request(app).get('/api/v1/workflows');
    expect(list.body).toContain('test');

    const wf = await request(app).get('/api/v1/workflows/test');
    expect(wf.body).toEqual({ nodes: {}, edges: [] });

    await request(app).delete('/api/v1/workflows/test').expect(200);
    const list2 = await request(app).get('/api/v1/workflows');
    expect(list2.body).not.toContain('test');
  });
});
