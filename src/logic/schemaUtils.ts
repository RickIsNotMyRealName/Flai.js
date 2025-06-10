export interface SchemaEntry {
  name: string;
  type: string;
  required: boolean;
}

export function parseSchema(val: any): SchemaEntry[] {
  if (
    val &&
    typeof val === 'object' &&
    val.type === 'object' &&
    typeof val.properties === 'object'
  ) {
    const req: string[] = Array.isArray(val.required) ? val.required : [];
    return Object.keys(val.properties).map((k) => ({
      name: k,
      type: (val.properties as any)[k].type || 'string',
      required: req.includes(k),
    }));
  }
  return [];
}

export function buildSchema(entries: SchemaEntry[]): any {
  const properties: Record<string, { type: string }> = {};
  const required: string[] = [];
  for (const e of entries) {
    if (!e.name) continue;
    properties[e.name] = { type: e.type };
    if (e.required) required.push(e.name);
  }
  const schema: any = { type: 'object', properties };
  if (required.length) schema.required = required;
  return schema;
}
