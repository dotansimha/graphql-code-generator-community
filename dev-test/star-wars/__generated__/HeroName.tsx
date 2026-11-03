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

export type HeroNameQueryVariables = Exact<{
  episode?: Types.Episode | null | undefined;
}>;

export type HeroNameQuery = { hero: { name: string } | { name: string } | null };

export const HeroNameDocument = gql`
  query HeroName($episode: Episode) {
    hero(episode: $episode) {
      name
    }
  }
`;

/**
 * __useHeroNameQuery__
 *
 * To run a query within a React component, call `useHeroNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useHeroNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHeroNameQuery({
 *   variables: {
 *      episode: // value for 'episode'
 *   },
 * });
 */
export function useHeroNameQuery(
  baseOptions?: Apollo.QueryHookOptions<HeroNameQuery, HeroNameQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HeroNameQuery, HeroNameQueryVariables>(HeroNameDocument, options);
}
export function useHeroNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<HeroNameQuery, HeroNameQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HeroNameQuery, HeroNameQueryVariables>(HeroNameDocument, options);
}
// @ts-ignore
export function useHeroNameSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<HeroNameQuery, HeroNameQueryVariables>,
): Apollo.UseSuspenseQueryResult<HeroNameQuery, HeroNameQueryVariables>;
export function useHeroNameSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<HeroNameQuery, HeroNameQueryVariables>,
): Apollo.UseSuspenseQueryResult<HeroNameQuery | undefined, HeroNameQueryVariables>;
export function useHeroNameSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<HeroNameQuery, HeroNameQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<HeroNameQuery, HeroNameQueryVariables>(HeroNameDocument, options);
}
export type HeroNameQueryHookResult = ReturnType<typeof useHeroNameQuery>;
export type HeroNameLazyQueryHookResult = ReturnType<typeof useHeroNameLazyQuery>;
export type HeroNameSuspenseQueryHookResult = ReturnType<typeof useHeroNameSuspenseQuery>;
export type HeroNameQueryResult = Apollo.QueryResult<HeroNameQuery, HeroNameQueryVariables>;
