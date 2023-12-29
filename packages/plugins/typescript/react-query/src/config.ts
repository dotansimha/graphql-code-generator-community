import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

export type HardcodedFetch = { endpoint: string; fetchParams?: string | Record<string, any> };
export type CustomFetch = { func: string; isReactHook?: boolean } | string;
export type GraphQlRequest = 'graphql-request' | { clientImportPath: string };

export interface BaseReactQueryPluginConfig {
  /**
   * @default unknown
   * @description Changes the default "TError" generic type.
   */
  errorType?: string;

  /**
   * @default false
   * @description For each generate query hook adds `document` field with a
   * corresponding GraphQL query. Useful for `queryClient.fetchQuery`.
   * @exampleMarkdown
   * ```ts
   * queryClient.fetchQuery(
   *   useUserDetailsQuery.getKey(variables),
   *   () => gqlRequest(useUserDetailsQuery.document, variables)
   * )
   * ```
   */
  exposeDocument?: boolean;

  /**
   * @default false
   * @description For each generate query hook adds getKey(variables: QueryVariables) function. Useful for cache updates. If addInfiniteQuery is true, it will also add a getKey function to each infinite query.
   * @exampleMarkdown
   * ```ts
   * const query = useUserDetailsQuery(...)
   * const key = useUserDetailsQuery.getKey({ id: theUsersId })
   * // use key in a cache update after a mutation
   * ```
   */
  exposeQueryKeys?: boolean;

  /**
   * @default false
   * @description For each generate query hook adds rootKey. Useful for cache updates.
   * @exampleMarkdown
   * ```ts
   * const query = useUserDetailsQuery(...)
   * const key = useUserDetailsQuery.rootKey
   * // use key in a cache update after a mutation
   * ```
   */
  exposeQueryRootKeys?: boolean;

  /**
   * @default false
   * @description For each generate mutation hook adds getKey() function. Useful for call outside of functional component.
   * @exampleMarkdown
   * ```ts
   * const mutation = useUserDetailsMutation(...)
   * const key = useUserDetailsMutation.getKey()
   * ```
   */
  exposeMutationKeys?: boolean;

  /**
   * @default false
   * @description For each generate query hook adds `fetcher` field with a corresponding GraphQL query using the fetcher.
   * It is useful for `queryClient.fetchQuery` and `queryClient.prefetchQuery`.
   * @exampleMarkdown
   * ```ts
   * await queryClient.prefetchQuery(userQuery.getKey(), () => userQuery.fetcher())
   * ```
   */
  exposeFetcher?: boolean;

  /**
   * @default false
   * @description Adds an Infinite Query along side the standard one
   */
  addInfiniteQuery?: boolean;

  /**
   * @default false
   * @description Adds a Suspense Query along side the standard one
   */
  addSuspenseQuery?: boolean;

  /**
   * @default false
   * @description If true, it imports `react-query` not `@tanstack/react-query`, default is false.
   * @deprecated Please use `reactQueryVersion` instead.
   */
  legacyMode?: boolean;

  /**
   * @default 4
   * @description The version of react-query to use. Will override the legacyMode option.
   */
  reactQueryVersion?: 3 | 4 | 5;

  /**
   * @default empty
   * @description Add custom import for react-query.
   * It can be used to import from `@tanstack/react-query` instead of `react-query`. But make sure it include useQuery, UseQueryOptions, useMutation, UseMutationOptions, useInfiniteQuery, UseInfiniteQueryOptions
   *
   * The following options are available to use:
   *
   * - "src/your-own-react-query-customized": import { useQuery, UseQueryOptions, useMutation, UseMutationOptions, useInfiniteQuery, UseInfiniteQueryOptions } from your own react-query customized package.
   */
  reactQueryImportFrom?: string;
}

/**
 * @description This plugin generates `React-Query` Hooks with TypeScript typings.
 *
 * It extends the basic TypeScript plugins: `@graphql-codegen/typescript`, `@graphql-codegen/typescript-operations` - and thus shares a similar configuration.
 *
 * > **If you are using the `react-query` package instead of the `@tanstack/react-query` package in your project, please set the `legacyMode` option to `true`.**
 *
 */
export interface ReactQueryRawPluginConfig
  extends Omit<
      RawClientSideBasePluginConfig,
      | 'documentMode'
      | 'noGraphQLTag'
      | 'gqlImport'
      | 'documentNodeImport'
      | 'noExport'
      | 'importDocumentNodeExternallyFrom'
      | 'useTypeImports'
      | 'legacyMode'
    >,
    BaseReactQueryPluginConfig {
  /**
   * @description Customize the fetcher you wish to use in the generated file. React-Query is agnostic to the data-fetching layer, so you should provide it, or use a custom one.
   *
   * The following options are available to use:
   *
   * - 'fetch' - requires you to specify endpoint and headers on each call, and uses `fetch` to do the actual http call.
   * - `{ endpoint: string, fetchParams: RequestInit }`: hardcode your endpoint and fetch options into the generated output, using the environment `fetch` method. You can also use `process.env.MY_VAR` as endpoint or header value.
   * - `file#identifier` - You can use custom fetcher method that should implement the exported `ReactQueryFetcher` interface. Example: `./my-fetcher#myCustomFetcher`.
   * - `graphql-request`: Will generate each hook with `client` argument, where you should pass your own `GraphQLClient` (created from `graphql-request`).
   */
  fetcher?: 'fetch' | HardcodedFetch | GraphQlRequest | CustomFetch;
}
