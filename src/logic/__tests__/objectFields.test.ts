import { describe, it, expect } from 'vitest';
import { validateWorkflow } from '../pinValidation';
import type { NodeInstance, EdgeInstance, NodeType } from '../../types';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// define a simple node type requiring an object field
const objectNode: NodeType = {
  id: 'object.node',
  name: 'Object Node',
  tags: [],
  layout: 'singleRow',
  inputs: [],
  outputs: [],
  fields: [
    { id: 'config', name: 'Config', label: 'Config', type: 'object', required: true }
  ]
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const json = readFileSync(join(__dirname, '../../../public/nodeTypes.json'), 'utf-8');
const defs: { types: Record<string, string | null>; nodes: NodeType[] } = JSON.parse(json);
const hierarchy = defs.types;
const nodeTypes = [...defs.nodes, objectNode];

function makeNode(fields: Record<string, unknown>, uuid = '1'): NodeInstance {
  return { uuid, nodeTypeId: 'object.node', position: { x: 0, y: 0 }, fields };
}

describe('object field handling', () => {
  it('fails validation when required object field is empty', () => {
    const nodes: Record<string, NodeInstance> = {
      start: { uuid: 's', nodeTypeId: 'workflow.start', position: { x: 0, y: 0 }, fields: {} },
      end: { uuid: 'e', nodeTypeId: 'workflow.end', position: { x: 0, y: 0 }, fields: {} },
      obj: makeNode({})
    };
    const edges: EdgeInstance[] = [];
    const err = validateWorkflow(nodes, edges, nodeTypes, hierarchy);
    expect(err).toMatch(/required/i);
  });

  it('serializes and deserializes object fields', () => {
    const node = makeNode({ config: { a: 1, b: 'two' } });
    const str = JSON.stringify(node);
    const parsed = JSON.parse(str) as NodeInstance;
    expect(parsed.fields).toEqual(node.fields);
  });
});
