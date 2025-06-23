export type PinCardinality = 'one' | 'many' | { exact: number };

export interface Pin {
  id: string;
  name: string;
  direction: 'input' | 'output';
  type: string;
  cardinality: PinCardinality;
  required?: boolean;
}

export interface Field {
  id: string;
  name: string;
  label: string;
  type: 'string' | 'integer' | 'float' | 'bool' | 'enum';
  required?: boolean;
  options?: string[];
  default?: unknown;
}

export interface NodeType {
  id: string;
  name: string;
  icon?: string;
  tags: string[];
  category?: string;
  layout: 'singleRow';
  inputs: Pin[];
  outputs: Pin[];
  fields: Field[];
  editors?: ('tool' | 'agent')[];
}

export interface NodeInstance {
  uuid: string;
  nodeTypeId: string;
  position: { x: number; y: number };
  fields: Record<string, unknown>;
}

export interface EdgeInstance {
  id: string;
  from: { uuid: string; pin: string };
  to: { uuid: string; pin: string };
}

export interface ToolMeta {
  name: string;
  description: string;
  schema: string;
}

export interface ToolData {
  meta: ToolMeta;
  nodes: Record<string, NodeInstance>;
  edges: EdgeInstance[];
}

export interface AssistantData {
  name: string;
  system: string;
  model: string;
  tools: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Chat {
  id: number;
  title: string;
  messages: ChatMessage[];
}

export interface Settings {
  theme: 'light' | 'dark';
}
