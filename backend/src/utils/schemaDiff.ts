import { JSONSchema, SchemaDiff, DiffChange } from '../types';





export function computeSchemaDiff(
  oldSchema: JSONSchema | undefined,
  newSchema: JSONSchema,
  fromVersion: number,
  toVersion: number,
): SchemaDiff {
  const changes: DiffChange[] = [];

  const oldProps = oldSchema?.properties || {};
  const newProps = newSchema.properties || {};
  const oldRequired = new Set(oldSchema?.required || []);
  const newRequired = new Set(newSchema.required || []);


  for (const field of Object.keys(newProps)) {
    if (!(field in oldProps)) {
      changes.push({
        field,
        type: 'added',
        newValue: newProps[field],
      });
    }
  }


  for (const field of Object.keys(oldProps)) {
    if (!(field in newProps)) {
      changes.push({
        field,
        type: 'removed',
        oldValue: oldProps[field],
      });
    }
  }


  for (const field of Object.keys(newProps)) {
    if (field in oldProps) {
      const oldProp = JSON.stringify(oldProps[field]);
      const newProp = JSON.stringify(newProps[field]);
      const requiredChanged = oldRequired.has(field) !== newRequired.has(field);

      if (oldProp !== newProp || requiredChanged) {
        changes.push({
          field,
          type: 'modified',
          oldValue: oldProps[field],
          newValue: newProps[field],
        });
      }
    }
  }

  return { changes, fromVersion, toVersion };
}





export function mergeSchemas(
  existing: JSONSchema,
  incoming: JSONSchema,
): JSONSchema {
  const merged: JSONSchema = {
    ...existing,
    ...incoming,
    properties: {
      ...(existing.properties || {}),
      ...(incoming.properties || {}),
    },
  };


  const existingRequired = new Set(existing.required || []);
  const incomingRequired = new Set(incoming.required || []);
  const allRequired = new Set([...existingRequired, ...incomingRequired]);


  const validRequired = [...allRequired].filter(
    (field) => merged.properties && field in merged.properties,
  );

  if (validRequired.length > 0) {
    merged.required = validRequired;
  }

  return merged;
}
