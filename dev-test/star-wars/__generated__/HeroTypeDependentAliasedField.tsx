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

export type HeroTypeDependentAliasedFieldQueryVariables = Exact<{
  episode?: Types.Episode | null | undefined;
}>;

export type HeroTypeDependentAliasedFieldQuery = {
  hero: { property: string | null } | { property: string | null } | null;
};

export const HeroTypeDependentAliasedFieldDocument = gql`
  query HeroTypeDependentAliasedField($episode: Episode) {
    hero(episode: $episode) {
      ... on Human {
        property: homePlanet
      }
      ... on Droid {
        property: primaryFunction
      }
    }
  }
`;

/**
 * __useHeroTypeDependentAliasedFieldQuery__
 *
 * To run a query within a React component, call `useHeroTypeDependentAliasedFieldQuery` and pass it any options that fit your needs.
 * When your component renders, `useHeroTypeDependentAliasedFieldQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHeroTypeDependentAliasedFieldQuery({
 *   variables: {
 *      episode: // value for 'episode'
 *   },
 * });
 */
export function useHeroTypeDependentAliasedFieldQuery(
  baseOptions?: Apollo.QueryHookOptions<
    HeroTypeDependentAliasedFieldQuery,
    HeroTypeDependentAliasedFieldQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    HeroTypeDependentAliasedFieldQuery,
    HeroTypeDependentAliasedFieldQueryVariables
  >(HeroTypeDependentAliasedFieldDocument, options);
}
export function useHeroTypeDependentAliasedFieldLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    HeroTypeDependentAliasedFieldQuery,
    HeroTypeDependentAliasedFieldQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    HeroTypeDependentAliasedFieldQuery,
    HeroTypeDependentAliasedFieldQueryVariables
  >(HeroTypeDependentAliasedFieldDocument, options);
}
// @ts-ignore
export function useHeroTypeDependentAliasedFieldSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    HeroTypeDependentAliasedFieldQuery,
    HeroTypeDependentAliasedFieldQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  HeroTypeDependentAliasedFieldQuery,
  HeroTypeDependentAliasedFieldQueryVariables
>;
export function useHeroTypeDependentAliasedFieldSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        HeroTypeDependentAliasedFieldQuery,
        HeroTypeDependentAliasedFieldQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  HeroTypeDependentAliasedFieldQuery | undefined,
  HeroTypeDependentAliasedFieldQueryVariables
>;
export function useHeroTypeDependentAliasedFieldSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        HeroTypeDependentAliasedFieldQuery,
        HeroTypeDependentAliasedFieldQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    HeroTypeDependentAliasedFieldQuery,
    HeroTypeDependentAliasedFieldQueryVariables
  >(HeroTypeDependentAliasedFieldDocument, options);
}
export type HeroTypeDependentAliasedFieldQueryHookResult = ReturnType<
  typeof useHeroTypeDependentAliasedFieldQuery
>;
export type HeroTypeDependentAliasedFieldLazyQueryHookResult = ReturnType<
  typeof useHeroTypeDependentAliasedFieldLazyQuery
>;
export type HeroTypeDependentAliasedFieldSuspenseQueryHookResult = ReturnType<
  typeof useHeroTypeDependentAliasedFieldSuspenseQuery
>;
export type HeroTypeDependentAliasedFieldQueryResult = Apollo.QueryResult<
  HeroTypeDependentAliasedFieldQuery,
  HeroTypeDependentAliasedFieldQueryVariables
>;
