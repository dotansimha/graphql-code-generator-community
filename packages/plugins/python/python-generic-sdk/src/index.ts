import { concatAST, GraphQLSchema, Kind, OperationDefinitionNode, print, visit } from 'graphql';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import {
  constantCase,
  pythonFieldName as methodName,
  pascalCase,
} from '@graphql-codegen/python-common';
import { PythonGenericSdkConfig } from './config.js';

export * from './config.js';

const INDENT = '    ';

/** query -> Query, mutation -> Mutation, subscription -> Subscription. */
function operationTypeName(op: OperationDefinitionNode): string {
  return op.operation.charAt(0).toUpperCase() + op.operation.slice(1);
}

/**
 * An operation's `variables` argument gets a `= None` default when it can be
 * omitted entirely, i.e. there are no variables, or every variable is nullable
 * / has a default value. A single required (non-null, no default) variable
 * makes the argument required.
 */
function variablesAreOptional(op: OperationDefinitionNode): boolean {
  const defs = op.variableDefinitions ?? [];
  return defs.every(def => def.type.kind !== Kind.NON_NULL_TYPE || def.defaultValue != null);
}

interface OperationMeta {
  documentConstant: string;
  documentValue: string;
  method: string;
  resultType: string;
  variablesType: string;
  variablesOptional: boolean;
}

/**
 * Fragments are not supported yet. Without inlining the fragment's fields into
 * the printed document, the emitted `..._DOCUMENT` string would reference a
 * fragment definition that is never sent to the server, producing a document
 * that fails at request time instead of at generation time. Fail loudly here
 * instead.
 */
function assertNoFragments(op: OperationDefinitionNode): void {
  const opName = op.name?.value ?? '<anonymous>';
  visit(op, {
    FragmentSpread(node) {
      throw new Error(
        `@graphql-codegen/python-generic-sdk: fragment spread "...${node.name.value}" in ` +
          `operation "${opName}" is not supported yet. Inline the fragment's fields directly into ` +
          'the operation for now.',
      );
    },
    InlineFragment(node) {
      const onType = node.typeCondition?.name.value ?? 'Type';
      throw new Error(
        `@graphql-codegen/python-generic-sdk: inline fragment "... on ${onType}" in operation ` +
          `"${opName}" is not supported yet. Union/interface member selections cannot be ` +
          'generated; select only common fields for now.',
      );
    },
  });
}

function buildOperationMeta(op: OperationDefinitionNode): OperationMeta {
  if (!op.name?.value) {
    throw new Error(
      '@graphql-codegen/python-generic-sdk requires every operation to be named. ' +
        'Anonymous operations are not supported.',
    );
  }
  assertNoFragments(op);

  const name = op.name.value;
  const resultType = `${pascalCase(name)}${operationTypeName(op)}`;

  return {
    documentConstant: `${constantCase(name)}_DOCUMENT`,
    documentValue: print(op),
    method: methodName(name),
    resultType,
    variablesType: `${resultType}Variables`,
    variablesOptional: variablesAreOptional(op),
  };
}

/** `NAME_DOCUMENT = """<printed operation>"""`. */
function buildDocumentConstant(meta: OperationMeta): string {
  // Escape backslashes and double-quotes so an operation with inline string
  // arguments (e.g. a regex like `pattern: "\\d+"`) or an embedded `"` can't
  // corrupt or prematurely terminate the Python triple-quoted literal.
  const escaped = meta.documentValue.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `${meta.documentConstant} = """${escaped}"""`;
}

/**
 * The SDK's own top-level symbols. These share a module with whatever
 * `@graphql-codegen/python` emitted for the schema, so a schema type named e.g.
 * `Requester` would be silently shadowed (real-world schemas do define one).
 * Suffix ours when the schema already claims the name.
 */
function resolveSdkNames(schema: GraphQLSchema) {
  const taken = new Set(Object.keys(schema.getTypeMap()));
  const pick = (preferred: string) => {
    if (!taken.has(preferred)) return preferred;
    let i = 2;
    while (taken.has(`${preferred}${i}`)) i++;
    return `${preferred}${i}`;
  };
  return { requester: pick('Requester') };
}

/** The shared `Requester` Protocol emitted once per file. */
function buildRequesterProtocol(asyncMethods: boolean, requesterName: string): string {
  const def = asyncMethods ? 'async def' : 'def';
  return [
    `class ${requesterName}(Protocol):`,
    `${INDENT}${def} __call__(self, doc: str, variables: 'Any' = None, options: 'Any' = None) -> 'Any':`,
    `${INDENT}${INDENT}...`,
  ].join('\n');
}

/** One `def <method>(...)` for the inner `Sdk` class. */
function buildMethod(meta: OperationMeta, asyncMethods: boolean): string {
  // `= None` must be typed `Optional[...]`, or a type checker rejects the default
  // against the (non-optional) variables TypedDict.
  const variablesArg = meta.variablesOptional
    ? `variables: 'Optional[${meta.variablesType}]' = None`
    : `variables: '${meta.variablesType}'`;
  const def = asyncMethods ? 'async def' : 'def';
  const signature = `${def} ${meta.method}(self, ${variablesArg}, options: 'Any' = None) -> '${meta.resultType}':`;
  // Hydrate the raw wire result into the operation result model and return the
  // full typed object (attribute access + recursive hydration). The result types
  // are pydantic models, so hydrate via `model_validate` (the wire dict uses
  // aliases). The runtime `execute` (and therefore the requester) is async, so
  // async methods `await` the raw result before hydrating.
  const call = `requester(${meta.documentConstant}, variables, options)`;
  const raw = asyncMethods ? `await ${call}` : call;
  const body = `return ${meta.resultType}.model_validate(${raw})`;
  return [`${INDENT}${INDENT}${signature}`, `${INDENT}${INDENT}${INDENT}${body}`].join('\n');
}

/** `def get_sdk(requester): class Sdk: ...  return Sdk()`. */
function buildGetSdk(metas: OperationMeta[], asyncMethods: boolean, requesterName: string): string {
  const body =
    metas.length === 0
      ? `${INDENT}${INDENT}pass`
      : metas.map(meta => buildMethod(meta, asyncMethods)).join('\n\n');
  return [
    `def get_sdk(requester: ${requesterName}):`,
    `${INDENT}class Sdk:`,
    body,
    '',
    `${INDENT}return Sdk()`,
  ].join('\n');
}

/**
 * Document-driven plugin (like `typescript-generic-sdk`): for each named
 * GraphQL operation, emit a document constant plus a `get_sdk(requester)`
 * factory with one method per operation. Type references are generated to match
 * `@graphql-codegen/python-operations` exactly.
 *
 * We do NOT extend `ClientSideBaseVisitor` — its document emission is
 * TypeScript-syntax / brace-bound. Instead we print each operation with
 * graphql's `print`.
 */
export const plugin: PluginFunction<PythonGenericSdkConfig, Types.ComplexPluginOutput> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: PythonGenericSdkConfig,
) => {
  // The runtime `execute` is async, so by default the generated SDK methods and
  // the `Requester` protocol are `async` (and `await` the requester). Set
  // `asyncMethods: false` to emit the legacy synchronous form.
  const asyncMethods = config.asyncMethods ?? true;

  // Avoid shadowing a schema type of the same name (see resolveSdkNames).
  const { requester: requesterName } = resolveSdkNames(schema);

  const allAst = concatAST(documents.map(d => d.document).filter(Boolean) as any);

  const operations = allAst.definitions.filter(
    (def): def is OperationDefinitionNode => def.kind === Kind.OPERATION_DEFINITION,
  );

  const metas = operations.map(buildOperationMeta);

  // `Any` and `Protocol` are always referenced (Requester + options); `Optional`
  // is part of the fixed typing surface these SDKs expose.
  const imports = ['from typing import Any, Optional, Protocol'];

  if (metas.length === 0) {
    return {
      prepend: imports,
      content: [
        buildRequesterProtocol(asyncMethods, requesterName),
        buildGetSdk(metas, asyncMethods, requesterName),
      ].join('\n\n\n'),
    };
  }

  const documentConstants = metas.map(buildDocumentConstant).join('\n\n\n');

  const content = [
    documentConstants,
    buildRequesterProtocol(asyncMethods, requesterName),
    buildGetSdk(metas, asyncMethods, requesterName),
  ].join('\n\n\n');

  return {
    prepend: imports,
    content,
  };
};
