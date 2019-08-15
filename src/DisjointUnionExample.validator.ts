/* tslint:disable */
// generated by typescript-json-validator
import Ajv = require('ajv');
import {
  EntityTypes,
  EntityOne,
  EntityTwo,
  Entity,
  Value,
} from './DisjointUnionExample';
export const ajv = new Ajv({
  allErrors: true,
  coerceTypes: false,
  format: 'fast',
  nullable: true,
  unicode: true,
  uniqueItems: true,
  useDefaults: true,
});

ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));

export {EntityTypes, EntityOne, EntityTwo, Entity, Value};
export const Schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  definitions: {
    Entity: {
      else: {
        else: {
          else: {
            properties: {
              type: {
                enum: ['TypeOne', 'TypeTwo', 'TypeThree'],
                type: 'string',
              },
            },
            required: ['type'],
          },
          if: {
            properties: {
              type: {
                enum: ['TypeThree'],
                type: 'string',
              },
            },
            required: ['type'],
          },
          then: {
            defaultProperties: [],
            properties: {
              baz: {
                type: 'number',
              },
              type: {
                enum: ['TypeThree'],
                type: 'string',
              },
            },
            required: ['baz', 'type'],
            type: 'object',
          },
        },
        if: {
          properties: {
            type: {
              enum: ['TypeTwo'],
              type: 'string',
            },
          },
          required: ['type'],
        },
        then: {
          $ref: '#/definitions/EntityTwo',
        },
      },
      if: {
        properties: {
          type: {
            enum: ['TypeOne'],
            type: 'string',
          },
        },
        required: ['type'],
      },
      then: {
        $ref: '#/definitions/EntityOne',
      },
    },
    EntityOne: {
      defaultProperties: [],
      properties: {
        foo: {
          type: 'string',
        },
        type: {
          enum: ['TypeOne'],
          type: 'string',
        },
      },
      required: ['foo', 'type'],
      type: 'object',
    },
    EntityTwo: {
      defaultProperties: [],
      properties: {
        bar: {
          type: 'string',
        },
        type: {
          enum: ['TypeTwo'],
          type: 'string',
        },
      },
      required: ['bar', 'type'],
      type: 'object',
    },
    EntityTypes: {
      enum: ['TypeOne', 'TypeThree', 'TypeTwo'],
      type: 'string',
    },
    Value: {
      else: {
        else: {
          else: {
            properties: {
              number: {
                enum: [0, 1, 2],
                type: 'number',
              },
            },
            required: ['number'],
          },
          if: {
            properties: {
              number: {
                enum: [2],
                type: 'number',
              },
            },
            required: ['number'],
          },
          then: {
            defaultProperties: [],
            properties: {
              baz: {
                type: 'string',
              },
              number: {
                enum: [2],
                type: 'number',
              },
            },
            required: ['baz', 'number'],
            type: 'object',
          },
        },
        if: {
          properties: {
            number: {
              enum: [1],
              type: 'number',
            },
          },
          required: ['number'],
        },
        then: {
          defaultProperties: [],
          properties: {
            bar: {
              type: 'string',
            },
            number: {
              enum: [1],
              type: 'number',
            },
          },
          required: ['bar', 'number'],
          type: 'object',
        },
      },
      if: {
        properties: {
          number: {
            enum: [0],
            type: 'number',
          },
        },
        required: ['number'],
      },
      then: {
        defaultProperties: [],
        properties: {
          foo: {
            type: 'string',
          },
          number: {
            enum: [0],
            type: 'number',
          },
        },
        required: ['foo', 'number'],
        type: 'object',
      },
    },
  },
};
ajv.addSchema(Schema, 'Schema');
export function validate(
  typeName: 'EntityTypes',
): (value: unknown) => EntityTypes;
export function validate(typeName: 'EntityOne'): (value: unknown) => EntityOne;
export function validate(typeName: 'EntityTwo'): (value: unknown) => EntityTwo;
export function validate(typeName: 'Entity'): (value: unknown) => Entity;
export function validate(typeName: 'Value'): (value: unknown) => Value;
export function validate(typeName: string): (value: unknown) => any {
  const validator: any = ajv.getSchema(`Schema#/definitions/${typeName}`);
  return (value: unknown): any => {
    if (!validator) {
      throw new Error(
        `No validator defined for Schema#/definitions/${typeName}`,
      );
    }

    const valid = validator(value);

    if (!valid) {
      throw new Error(
        'Invalid ' +
          typeName +
          ': ' +
          ajv.errorsText(
            validator.errors!.filter((e: any) => e.keyword !== 'if'),
            {dataVar: typeName},
          ),
      );
    }

    return value as any;
  };
}