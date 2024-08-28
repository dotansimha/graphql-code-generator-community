import { NormalizedScalarsMap } from '@graphql-codegen/visitor-plugin-common';

export const C_SHARP_SCALARS: NormalizedScalarsMap = {
  ID: {
    input: 'string',
    output: 'string',
  },
  String: {
    input: 'string',
    output: 'string',
  },
  Boolean: {
    input: 'bool',
    output: 'bool',
  },
  Int: {
    input: 'int',
    output: 'int',
  },
  Float: {
    input: 'double',
    output: 'double',
  },
  Date: {
    input: 'DateTime',
    output: 'DateTime',
  },
};

export const csharpValueTypes = [
  'bool',
  'byte',
  'sbyte',
  'char',
  'decimal',
  'double',
  'float',
  'int',
  'uint',
  'long',
  'ulong',
  'short',
  'ushort',
  'DateTime',
];
