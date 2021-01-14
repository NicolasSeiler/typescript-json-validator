import * as TJS from 'typescript-json-schema';

export default function normalizeSchema(
  schema: TJS.Definition,
): TJS.Definition {
  let result = schema;
  if (schema.anyOf && schema.definitions) {
    let {anyOf, ...extra} = schema;
    result = {...processAnyOf(anyOf, schema.definitions), ...extra};
  }
  let outputDefinitions: {
    [key: string]: TJS.DefinitionOrBoolean;
  } = {};
  if (schema.definitions) {
    const defs: {
      [key: string]: TJS.DefinitionOrBoolean;
    } = schema.definitions;
    Object.keys(defs).forEach(definition => {
      const def = defs[definition];
      if (
        typeof def !== 'boolean' &&
        def.anyOf &&
        Object.keys(def).length === 1
      ) {
        outputDefinitions[definition] = processAnyOf(def.anyOf!, defs);
      } else {
        outputDefinitions[definition] = defs[definition];
      }
    });
  }
  return {
    ...result,
    definitions: schema.definitions ? outputDefinitions : schema.definitions,
  };
}

function processAnyOf(
  types: TJS.DefinitionOrBoolean[],
  definitions: {
    [key: string]: TJS.DefinitionOrBoolean;
  },
): TJS.Definition {
  function resolve(ref: TJS.DefinitionOrBoolean) {
    if (typeof ref === 'boolean') {
      return ref;
    }

    let match;
    if (
      ref.$ref &&
      (match = /\#\/definitions\/([a-zA-Z0-9_]+)/.exec(ref.$ref)) &&
      definitions[match[1]]
    ) {
      return definitions[match[1]];
    } else {
      return ref;
    }
  }
  const resolved = types.map(resolve).filter(isNotBoolean);
  const typeKeys = intersect(resolved.map(getCandidates)).filter(candidate => {
    const seen = new Set<number | string>();
    const firstType = getType(resolved[0], candidate);
    return resolved.every(type => {
      const v = getValue(type, candidate);
      if (seen.has(v) || getType(type, candidate) !== firstType) {
        return false;
      } else {
        seen.add(v);
        return true;
      }
    });
  });
  if (typeKeys.length !== 1) {
    return {anyOf: types};
  }
  const key = typeKeys[0];
  const type = getType(resolved[0], key);

  function recurse(remainingTypes: TJS.Definition[]): TJS.Definition {
    if (remainingTypes.length === 0) {
      return {
        properties: {
          [key]: {
            type,
            enum: resolved.map(type => getValue(type, key)),
          },
        },
        required: [key],
      };
    } else {
      return {
        if: {
          properties: {
            [key]: {
              type,
              enum: [
                getValue(resolve(remainingTypes[0]) as TJS.Definition, key),
              ],
            },
          },
          required: [key],
        },
        then: remainingTypes[0],
        else: recurse(remainingTypes.slice(1)),
      } as any;
    }
  }
  return recurse(types.filter(isNotBoolean));
}

function getCandidates(type: TJS.Definition) {
  const required = type.required || [];
  return required.filter(key => {
    if (type.properties) {
      const property = type.properties[key];
      if (typeof property === 'boolean') {
        return false;
      }

      return (
        property &&
        (property.type === 'string' || property.type === 'number') &&
        property.enum &&
        property.enum.length === 1
      );
    }

    return false;
  });
}
function getType(type: TJS.Definition, key: string): string {
  const property = type.properties![key];
  if (typeof property === 'boolean') {
    throw new Error('Can not fetch type of boolean property');
  }

  return property.type as string;
}
function getValue(type: TJS.Definition, key: string): string | number {
  const property = type.properties![key];
  if (typeof property === 'boolean') {
    throw new Error('Can not fetch type of boolean property');
  }

  return property.enum![0] as string | number;
}
function intersect(values: string[][]): string[] {
  return values[0].filter(v => values.every(vs => vs.includes(v)));
}
function isNotBoolean(value: TJS.DefinitionOrBoolean): value is TJS.Definition {
  return typeof value !== 'boolean';
}
