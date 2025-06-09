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

import type { EdgeInstance, NodeInstance, Pin } from '../types';

function countConnections(
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

function cardinalityExceeded(
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
