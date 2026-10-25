import { constantCase, pascalCase, snakeCase } from 'change-case-all';
import { PYTHON_KEYWORDS } from './keywords.js';

/**
 * This module is the single place in the Python plugin family that imports
 * `change-case-all`. The plugins route their snake / pascal / constant casing
 * through these exports so the generated names line up exactly and no consumer
 * hand-rolls (or diverges on) the acronym-splitting rules.
 */

/**
 * snake_case a GraphQL name for use as a Python identifier (field, method, or
 * document-constant base name), appending a trailing `_` when the result
 * collides with a reserved keyword.
 *
 * Uses change-case-all's `snakeCase` — the same implementation
 * `@graphql-codegen/python`'s `pascalCase` (via `BaseVisitor.convertName`)
 * already relies on — so acronym runs split identically on both sides, e.g.
 * `httpURL` -> `http_url` lines up with `HttpUrl`. A hand-rolled
 * implementation previously diverged for `pascalCase` on `GetHTTPStatus`.
 *
 * Each consumer previously duplicated this exact function under a locally
 * meaningful name (`methodName`, `pyFieldName`, `snakeFieldName`); import and
 * alias it the same way here instead of re-implementing it.
 */
export function pythonFieldName(name: string): string {
  const snake = snakeCase(name);
  return PYTHON_KEYWORDS.has(snake) ? `${snake}_` : snake;
}

/**
 * Whether a GraphQL response key maps to a Python reserved keyword once
 * snake-cased (before any trailing-`_` escaping is applied).
 */
export function isReservedField(name: string): boolean {
  return PYTHON_KEYWORDS.has(snakeCase(name));
}

/**
 * PascalCase a name for a generated Python class / result-type name.
 *
 * This is the exact `change-case-all` `pascalCase` that
 * `@graphql-codegen/python` and `@graphql-codegen/python-operations` use via
 * `BaseVisitor.convertName`, re-exported so a plugin that does NOT extend the
 * base visitor produces byte-identical class names, including acronym runs,
 * e.g. `GetHTTPStatus` -> `GetHttpStatus`.
 */
export { constantCase, pascalCase };
