import type { NormalizedScalarsMap } from '@graphql-codegen/visitor-plugin-common';

/**
 * Default GraphQL scalar -> Python type mapping. Custom scalars fall back to
 * `Any`.
 */
export const PYTHON_SCALARS: NormalizedScalarsMap = {
  ID: { input: 'str', output: 'str' },
  String: { input: 'str', output: 'str' },
  Int: { input: 'int', output: 'int' },
  Float: { input: 'float', output: 'float' },
  Boolean: { input: 'bool', output: 'bool' },
};
