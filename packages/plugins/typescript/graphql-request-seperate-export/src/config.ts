import {
  ClientSideBasePluginConfig,
  RawClientSideBasePluginConfig,
} from '@graphql-codegen/visitor-plugin-common';

export type PluginConfig = {
  /**
   * example: `import { client } from '../your-graphql-client';`
   *
   * the imported `client` should be an instance of graphql-client
   */
  importGraphQLClientStatment: string;

  /**
   * @description By default the `request` method return the `data` or `errors` key from the response. If you need to access the `extensions` key you can use the `rawRequest` method.
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-graphql-request-seperate-export
   *  config:
   *    rawRequest: true
   *    pureMagicComment: true
   * ```
   */
  rawRequest?: boolean;
};

/**
 * This plugin generate a some request seperate export function with graphql-request, allow you to easily customize the way you fetch your data, without loosing the strongly-typed integration.
 */
export type RawGraphQLSeperateExportPluginConfig = RawClientSideBasePluginConfig & PluginConfig;
export type GraphQLSeperateExportPluginConfig = ClientSideBasePluginConfig & PluginConfig;
