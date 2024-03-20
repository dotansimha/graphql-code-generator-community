import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates a fully-typed, ready-to-use SDK written with [`effect`](https://effect.website).
 */

export interface RawEffectPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * @description Allows you to override the output mode of the `typescript-effect` codegen plugin. To generate the GraphQL client in a separate file, use the `client-only` and `operations-only` modes, respectively.
   * @default 'mixed'
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/client.ts': {
   *        plugins: ['typescript-effect'],
   *        config: {
   *          mode: 'client-only'
   *        },
   *      },
   *      'path/to/sdk.ts': {
   *        plugins: ['typescript', 'typescript-operations', 'typescript-effect'],
   *        config: {
   *          mode: 'operations-only',
   *          relativeClientImportPath: './client.js',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  mode?: 'client-only' | 'operations-only' | 'mixed';

  /**
   * @description Specifies the relative import path of the graphql client file. A required config when the mode is set to `operations-only`, ignored in all other cases.
   * @default undefined
   */
  relativeClientImportPath?: string;
}
