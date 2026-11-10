import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates a Python SDK from your GraphQL operation
 * documents, modeled on the community `typescript-generic-sdk` plugin.
 *
 * It is document-driven: for each named `OperationDefinition` it emits a
 * module-level document constant, a `Requester` `typing.Protocol`, and a
 * `get_sdk(requester)` factory whose returned object exposes one method per
 * operation.
 *
 * Type references (result / variables) are generated to line up exactly with
 * `@graphql-codegen/python-operations`, so run those plugins together.
 *
 * Config is intentionally minimal — it extends
 * `RawClientSideBasePluginConfig` for compatibility with the shared codegen
 * client-side config surface, but no extra options are required.
 *
 * @exampleMarkdown
 * ```ts filename="codegen.ts"
 *  import type { CodegenConfig } from '@graphql-codegen/cli';
 *
 *  const config: CodegenConfig = {
 *    generates: {
 *      'sdk.py': {
 *        plugins: [
 *          '@graphql-codegen/python',
 *          '@graphql-codegen/python-operations',
 *          '@graphql-codegen/python-generic-sdk',
 *        ],
 *      },
 *    },
 *  };
 *  export default config;
 * ```
 */
export interface PythonGenericSdkConfig extends RawClientSideBasePluginConfig {
  /**
   * @description Emit `async` SDK methods (and an `async` `Requester` protocol)
   * that `await` the requester before hydrating the result. Defaults to `true`
   * since the requester typically wraps an asynchronous transport.
   *
   * Set to `false` to emit the synchronous form (plain `def`, no `await`).
   * @default true
   */
  asyncMethods?: boolean;
}
