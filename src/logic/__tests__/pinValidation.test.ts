import { describe, it, expect } from 'vitest';
import { validateWorkflow } from '../pinValidation';
import type { NodeInstance, EdgeInstance, NodeType } from '../../types';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const json = readFileSync(join(__dirname, '../../../public/nodeTypes.json'), 'utf-8');
const defs: { types: Record<string, string | null>; nodes: NodeType[] } = JSON.parse(json);
const nodeTypes = defs.nodes;
const hierarchy = defs.types;

function makeNode(nodeTypeId: string, uuid: string, fields: Record<string, unknown> = {}): NodeInstance {
  return { uuid, nodeTypeId, position: { x: 0, y: 0 }, fields };
}

describe('validateWorkflow', () => {
  it('returns null for a valid workflow', () => {
    const nodes: Record<string, NodeInstance> = {
      start: makeNode('workflow.start', 'start'),
      end: makeNode('workflow.end', 'end'),
      chat: makeNode('openai.chatmodel', 'chat', { apiKey: 'k' }),
      embed: makeNode('openai.embeddings', 'embed', { apiKey: 'k' }),
      search: makeNode('tool.websearch', 'search'),
      agent: makeNode('agent', 'agent')
    };
    const edges: EdgeInstance[] = [
      { id: 'e1', from: { uuid: 'start', pin: 'stateOut' }, to: { uuid: 'agent', pin: 'stateIn' } },
      { id: 'e2', from: { uuid: 'chat', pin: 'modelOut' }, to: { uuid: 'agent', pin: 'modelIn' } },
      { id: 'e3', from: { uuid: 'chat', pin: 'modelOut' }, to: { uuid: 'search', pin: 'modelIn' } },
      { id: 'e4', from: { uuid: 'embed', pin: 'embedOut' }, to: { uuid: 'search', pin: 'embedIn' } },
      { id: 'e5', from: { uuid: 'search', pin: 'toolOut' }, to: { uuid: 'agent', pin: 'toolsIn' } },
      { id: 'e6', from: { uuid: 'agent', pin: 'stateOut' }, to: { uuid: 'end', pin: 'stateIn' } }
    ];
    expect(validateWorkflow(nodes, edges, nodeTypes, hierarchy)).toBeNull();
  });

  it('fails when end node is missing', () => {
    const nodes: Record<string, NodeInstance> = {
      start: makeNode('workflow.start', 'start'),
      agent: makeNode('agent', 'agent'),
      chat: makeNode('openai.chatmodel', 'chat', { apiKey: 'k' })
    };
    const edges: EdgeInstance[] = [
      { id: 'e1', from: { uuid: 'start', pin: 'stateOut' }, to: { uuid: 'agent', pin: 'stateIn' } }
      ,{ id: 'e2', from: { uuid: 'chat', pin: 'modelOut' }, to: { uuid: 'agent', pin: 'modelIn' } }
    ];
    const res = validateWorkflow(nodes, edges, nodeTypes, hierarchy);
    expect(typeof res).toBe('string');
    if (typeof res === 'string') {
      expect(res).toMatch(/missing end/);
    }
  });

  it('detects type mismatch', () => {
    const nodes: Record<string, NodeInstance> = {
      start: makeNode('workflow.start', 'start'),
      end: makeNode('workflow.end', 'end'),
      chat: makeNode('openai.chatmodel', 'chat', { apiKey: 'k' }),
      search: makeNode('tool.websearch', 'search'),
      agent: makeNode('agent', 'agent')
    };
    const edges: EdgeInstance[] = [
      { id: 'e1', from: { uuid: 'chat', pin: 'modelOut' }, to: { uuid: 'search', pin: 'embedIn' } },
      { id: 'e2', from: { uuid: 'chat', pin: 'modelOut' }, to: { uuid: 'search', pin: 'modelIn' } },
      { id: 'e3', from: { uuid: 'search', pin: 'toolOut' }, to: { uuid: 'agent', pin: 'toolsIn' } },
      { id: 'e4', from: { uuid: 'start', pin: 'stateOut' }, to: { uuid: 'agent', pin: 'stateIn' } },
      { id: 'e5', from: { uuid: 'chat', pin: 'modelOut' }, to: { uuid: 'agent', pin: 'modelIn' } },
      { id: 'e6', from: { uuid: 'agent', pin: 'stateOut' }, to: { uuid: 'end', pin: 'stateIn' } }
    ];
    const res = validateWorkflow(nodes, edges, nodeTypes, hierarchy);
    expect(typeof res).toBe('string');
    if (typeof res === 'string') {
      expect(res).toMatch(/Type mismatch/);
    }
  });

  it('detects exceeded cardinality', () => {
    const nodes: Record<string, NodeInstance> = {
      start: makeNode('workflow.start', 'start'),
      end: makeNode('workflow.end', 'end'),
      chat1: makeNode('openai.chatmodel', 'chat1', { apiKey: 'k' }),
      chat2: makeNode('openai.chatmodel', 'chat2', { apiKey: 'k' }),
      search: makeNode('tool.websearch', 'search'),
      embed: makeNode('openai.embeddings', 'embed', { apiKey: 'k' }),
      agent: makeNode('agent', 'agent')
    };
    const edges: EdgeInstance[] = [
      { id: 'e1', from: { uuid: 'chat1', pin: 'modelOut' }, to: { uuid: 'search', pin: 'modelIn' } },
      { id: 'e2', from: { uuid: 'chat2', pin: 'modelOut' }, to: { uuid: 'search', pin: 'modelIn' } },
      { id: 'e3', from: { uuid: 'embed', pin: 'embedOut' }, to: { uuid: 'search', pin: 'embedIn' } },
      { id: 'e4', from: { uuid: 'search', pin: 'toolOut' }, to: { uuid: 'agent', pin: 'toolsIn' } },
      { id: 'e5', from: { uuid: 'start', pin: 'stateOut' }, to: { uuid: 'agent', pin: 'stateIn' } },
      { id: 'e6', from: { uuid: 'chat1', pin: 'modelOut' }, to: { uuid: 'agent', pin: 'modelIn' } },
      { id: 'e7', from: { uuid: 'agent', pin: 'stateOut' }, to: { uuid: 'end', pin: 'stateIn' } }
    ];
    const result = validateWorkflow(nodes, edges, nodeTypes, hierarchy);
    expect(typeof result).toBe('string');
    if (typeof result === 'string') {
      expect(result).toMatch(/maximum connections/);
    }
  });

  it("fails when a tool's required inputs are missing", () => {
    const nodes: Record<string, NodeInstance> = {
      start: makeNode('workflow.start', 'start'),
      end: makeNode('workflow.end', 'end'),
      chat: makeNode('openai.chatmodel', 'chat', { apiKey: 'k' }),
      embed: makeNode('openai.embeddings', 'embed', { apiKey: 'k' }),
      search: makeNode('tool.websearch', 'search'),
      agent: makeNode('agent', 'agent')
    };
    const edges: EdgeInstance[] = [
      { id: 'e1', from: { uuid: 'start', pin: 'stateOut' }, to: { uuid: 'agent', pin: 'stateIn' } },
      { id: 'e2', from: { uuid: 'chat', pin: 'modelOut' }, to: { uuid: 'agent', pin: 'modelIn' } },
      { id: 'e3', from: { uuid: 'chat', pin: 'modelOut' }, to: { uuid: 'search', pin: 'modelIn' } },
      { id: 'e4', from: { uuid: 'search', pin: 'toolOut' }, to: { uuid: 'agent', pin: 'toolsIn' } },
      { id: 'e5', from: { uuid: 'agent', pin: 'stateOut' }, to: { uuid: 'end', pin: 'stateIn' } }
      // intentionally omit embedding connection to search.embedIn
    ];
    const result = validateWorkflow(nodes, edges, nodeTypes, hierarchy);
    expect(typeof result).toBe('string');
    if (typeof result === 'string') {
      expect(result).toMatch(/Embeddings.*Web Search/);
    }
  });

  it('allows required field with default to be omitted', () => {
    const nodes: Record<string, NodeInstance> = {
      start: makeNode('workflow.start', 'start'),
      end: makeNode('workflow.end', 'end'),
      chat: makeNode('openai.chatmodel', 'chat', { apiKey: 'k' }),
      agent: makeNode('agent', 'agent')
    };
    const edges: EdgeInstance[] = [
      { id: 'e1', from: { uuid: 'chat', pin: 'modelOut' }, to: { uuid: 'agent', pin: 'modelIn' } },
      { id: 'e2', from: { uuid: 'start', pin: 'stateOut' }, to: { uuid: 'agent', pin: 'stateIn' } },
      { id: 'e3', from: { uuid: 'agent', pin: 'stateOut' }, to: { uuid: 'end', pin: 'stateIn' } }
    ];
    expect(validateWorkflow(nodes, edges, nodeTypes, hierarchy)).toBeNull();
  });

  it('validates tool workflows with start and end', () => {
    const nodes: Record<string, NodeInstance> = {
      start: makeNode('tool.start', 'start'),
      end: makeNode('tool.end', 'end')
    };
    const edges: EdgeInstance[] = [
      { id: 'e1', from: { uuid: 'start', pin: 'stateOut' }, to: { uuid: 'end', pin: 'stateIn' } }
    ];
    expect(
      validateWorkflow(nodes, edges, nodeTypes, hierarchy, 'tool')
    ).toBeNull();
  });
});
