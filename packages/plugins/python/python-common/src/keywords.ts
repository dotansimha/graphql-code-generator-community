/**
 * Python reserved keywords (from the CPython `keyword` module, incl. the soft
 * keywords `match`/`case`). Names matching one of these get a trailing `_`
 * wherever they'd otherwise be used as a Python identifier.
 */
export const PYTHON_KEYWORDS = new Set<string>([
  'False',
  'None',
  'True',
  'and',
  'as',
  'assert',
  'async',
  'await',
  'break',
  'class',
  'continue',
  'def',
  'del',
  'elif',
  'else',
  'except',
  'finally',
  'for',
  'from',
  'global',
  'if',
  'import',
  'in',
  'is',
  'lambda',
  'nonlocal',
  'not',
  'or',
  'pass',
  'raise',
  'return',
  'try',
  'while',
  'with',
  'yield',
  'match',
  'case',
]);

/** A valid Python identifier (matches the GraphQL Name grammar plus keywords). */
export const PY_IDENT_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Whether `name` can be used as a plain Python class/dict attribute: it must
 * be a valid identifier AND not a reserved keyword. When it cannot, the
 * containing `TypedDict` must be emitted with functional syntax.
 */
export function isValidClassAttr(name: string): boolean {
  return PY_IDENT_RE.test(name) && !PYTHON_KEYWORDS.has(name);
}
