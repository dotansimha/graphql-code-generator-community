import {
  isReservedField,
  isValidClassAttr,
  pythonFieldName as pyFieldName,
  PYTHON_SCALARS,
} from '@graphql-codegen/python-common';

export { isReservedField, isValidClassAttr, PYTHON_SCALARS, pyFieldName };

export type PythonNamingConvention = 'keep' | 'snakeCase';

/**
 * Compute the attribute name for a `BaseModel` result class. Under `'snakeCase'`
 * the key is snake-cased (keywords suffixed with `_`); under `'keep'` the wire
 * name is used verbatim, but — because `BaseModel` classes cannot use functional
 * `TypedDict` syntax — a keyword / non-identifier name still falls back to a
 * trailing `_`.
 */
export function resultFieldKey(name: string, convention: PythonNamingConvention): string {
  if (convention === 'snakeCase') {
    return pyFieldName(name);
  }
  return isValidClassAttr(name) ? name : `${name}_`;
}

/**
 * Compute the `TypedDict` key for a GraphQL response / variable name under the
 * given naming convention. Under `'keep'` the raw name is returned verbatim
 * (functional `TypedDict` syntax handles invalid keys); under `'snakeCase'` the
 * legacy snake_case + `_`-suffix behavior is applied.
 */
export function fieldKey(name: string, convention: PythonNamingConvention): string {
  return convention === 'snakeCase' ? pyFieldName(name) : name;
}
