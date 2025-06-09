export function isSubtype(
  child: string,
  parent: string,
  hierarchy: Record<string, string | null>
): boolean {
  if (child === parent) return true;
  let cur = hierarchy[child];
  while (cur) {
    if (cur === parent) return true;
    cur = hierarchy[cur];
  }
  return false;
}

import type { EdgeInstance, NodeInstance, Pin, NodeType } from '../types';

export function countConnections(
  node: NodeInstance,
  pinId: string,
  direction: 'input' | 'output',
  edges: EdgeInstance[]
): number {
  return edges.filter((e) =>
    direction === 'input'
      ? e.to.uuid === node.uuid && e.to.pin === pinId
      : e.from.uuid === node.uuid && e.from.pin === pinId
  ).length;
}

export function cardinalityExceeded(
  pin: Pin,
  node: NodeInstance,
  direction: 'input' | 'output',
  edges: EdgeInstance[]
): boolean {
  const count = countConnections(node, pin.id, direction, edges);
  if (pin.cardinality === 'many') return false;
  if (pin.cardinality === 'one') return count >= 1;
  return count >= pin.cardinality.exact;
}

export function validateWorkflow(
  nodes: Record<string, NodeInstance>,
  edges: EdgeInstance[],
  nodeTypes: NodeType[],
  hierarchy: Record<string, string | null>
): string | null {
  const typeMap: Record<string, NodeType> = {};
  nodeTypes.forEach((nt) => {
    typeMap[nt.id] = nt;
  });

  for (const edge of edges) {
    const fromNode = nodes[edge.from.uuid];
    const toNode = nodes[edge.to.uuid];
    if (!fromNode || !toNode) return 'Edge references missing node';

    const fromType = typeMap[fromNode.nodeTypeId];
    const toType = typeMap[toNode.nodeTypeId];
    if (!fromType || !toType) return 'Edge references unknown node type';

    const fromPin = fromType.outputs.find((p) => p.id === edge.from.pin);
    const toPin = toType.inputs.find((p) => p.id === edge.to.pin);
    if (!fromPin || !toPin) return 'Edge references unknown pin';

    const err = validateConnection(
      fromNode,
      fromPin,
      toNode,
      toPin,
      hierarchy,
      edges
    );
    if (err) return err;
  }

  for (const node of Object.values(nodes)) {
    const def = typeMap[node.nodeTypeId];
    if (!def) return `Unknown node type ${node.nodeTypeId}`;

    for (const pin of def.inputs) {
      const count = countConnections(node, pin.id, 'input', edges);
      if (pin.cardinality === 'one' && count !== 1) {
        return `Input ${pin.name} of ${def.name} requires exactly one connection`;
      }
      if (typeof pin.cardinality === 'object' && count !== pin.cardinality.exact) {
        return `Input ${pin.name} of ${def.name} requires exactly ${pin.cardinality.exact} connections`;
      }
      if ((pin as any).required && count === 0) {
        return `Required input ${pin.name} of ${def.name} is not connected`;
      }
      if (cardinalityExceeded(pin, node, 'input', edges)) {
        return `Input pin cardinality exceeded on ${def.name}.${pin.name}`;
      }
    }

    for (const pin of def.outputs) {
      const count = countConnections(node, pin.id, 'output', edges);
      if (pin.cardinality === 'one' && count !== 1) {
        return `Output ${pin.name} of ${def.name} requires exactly one connection`;
      }
      if (typeof pin.cardinality === 'object' && count !== pin.cardinality.exact) {
        return `Output ${pin.name} of ${def.name} requires exactly ${pin.cardinality.exact} connections`;
      }
      if ((pin as any).required && count === 0) {
        return `Required output ${pin.name} of ${def.name} is not connected`;
      }
      if (cardinalityExceeded(pin, node, 'output', edges)) {
        return `Output pin cardinality exceeded on ${def.name}.${pin.name}`;
      }
    }

    for (const field of def.fields) {
      if (field.required) {
        const val = node.fields[field.id];
        if (val === undefined || val === '') {
          return `Field ${field.label} of ${def.name} is required`;
        }
      }
    }
  }

  return null;
}

export function validateConnection(
  fromNode: NodeInstance,
  fromPin: Pin,
  toNode: NodeInstance,
  toPin: Pin,
  hierarchy: Record<string, string | null>,
  edges: EdgeInstance[]
): string | null {
  if (fromPin.direction !== 'output' || toPin.direction !== 'input') {
    return 'Pins must connect output to input';
  }

  if (!isSubtype(fromPin.type, toPin.type, hierarchy)) {
    return `Type mismatch (${fromPin.type} → ${toPin.type})`;
  }

  if (cardinalityExceeded(fromPin, fromNode, 'output', edges)) {
    return 'Source pin cardinality exceeded';
  }

  if (cardinalityExceeded(toPin, toNode, 'input', edges)) {
    return 'Target pin cardinality exceeded';
  }

  return null;
}
