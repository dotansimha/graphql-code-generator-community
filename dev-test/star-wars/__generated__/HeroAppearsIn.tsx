import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
import * as Types from '../types.d.js';

/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };

const defaultOptions = {} as const;
/** The episodes in the Star Wars trilogy */
export type Episode =
  /** Star Wars Episode V: The Empire Strikes Back, released in 1980. */
  | 'EMPIRE'
  /** Star Wars Episode VI: Return of the Jedi, released in 1983. */
  | 'JEDI'
  /** Star Wars Episode IV: A New Hope, released in 1977. */
  | 'NEWHOPE';

export type HeroAppearsInQueryVariables = Exact<{ [key: string]: never }>;

export type HeroAppearsInQuery = {
  hero:
    | { name: string; appearsIn: Array<Types.Episode | null> }
    | { name: string; appearsIn: Array<Types.Episode | null> }
    | null;
};

export const HeroAppearsInDocument = gql`
  query HeroAppearsIn {
    hero {
      name
      appearsIn
    }
  }
`;

/**
 * __useHeroAppearsInQuery__
 *
 * To run a query within a React component, call `useHeroAppearsInQuery` and pass it any options that fit your needs.
 * When your component renders, `useHeroAppearsInQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHeroAppearsInQuery({
 *   variables: {
 *   },
 * });
 */
export function useHeroAppearsInQuery(
  baseOptions?: Apollo.QueryHookOptions<HeroAppearsInQuery, HeroAppearsInQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HeroAppearsInQuery, HeroAppearsInQueryVariables>(
    HeroAppearsInDocument,
    options,
  );
}
export function useHeroAppearsInLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<HeroAppearsInQuery, HeroAppearsInQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HeroAppearsInQuery, HeroAppearsInQueryVariables>(
    HeroAppearsInDocument,
    options,
  );
}
// @ts-ignore
export function useHeroAppearsInSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<HeroAppearsInQuery, HeroAppearsInQueryVariables>,
): Apollo.UseSuspenseQueryResult<HeroAppearsInQuery, HeroAppearsInQueryVariables>;
export function useHeroAppearsInSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<HeroAppearsInQuery, HeroAppearsInQueryVariables>,
): Apollo.UseSuspenseQueryResult<HeroAppearsInQuery | undefined, HeroAppearsInQueryVariables>;
export function useHeroAppearsInSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<HeroAppearsInQuery, HeroAppearsInQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<HeroAppearsInQuery, HeroAppearsInQueryVariables>(
    HeroAppearsInDocument,
    options,
  );
}
export type HeroAppearsInQueryHookResult = ReturnType<typeof useHeroAppearsInQuery>;
export type HeroAppearsInLazyQueryHookResult = ReturnType<typeof useHeroAppearsInLazyQuery>;
export type HeroAppearsInSuspenseQueryHookResult = ReturnType<typeof useHeroAppearsInSuspenseQuery>;
export type HeroAppearsInQueryResult = Apollo.QueryResult<
  HeroAppearsInQuery,
  HeroAppearsInQueryVariables
>;
