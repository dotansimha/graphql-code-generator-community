import { TypeScriptPluginConfig } from '@graphql-codegen/typescript';
import { DecoratorConfig } from './types.js';

export interface NestPluginConfig extends TypeScriptPluginConfig {
  /**
   * @name decoratorName
   * @description allow overriding of Nest decorator types
   * @default { type: 'ObjectType', interface: 'InterfaceType', arguments: 'ArgsType', field: 'Field', input: 'InputType' }
   */
  decoratorName?: Partial<DecoratorConfig>;

  /**
   * @name decorateTypes
   * @description Specifies the objects that will have Nest decorators prepended to them, by name. Non-matching types will still be output, but without decorators. If not set, all types will be decorated.
   * @exampleMarkdown Decorate only type User
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript-nest'],
   *        config: {
   *          decorateTypes: ['User']
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  decorateTypes?: string[];
}
