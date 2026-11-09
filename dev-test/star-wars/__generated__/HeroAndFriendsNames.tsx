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

export type HeroAndFriendsNamesQueryVariables = Exact<{
  episode?: Types.Episode | null | undefined;
}>;

export type HeroAndFriendsNamesQuery = {
  hero:
    | { name: string; friends: Array<{ name: string } | { name: string } | null> | null }
    | { name: string; friends: Array<{ name: string } | { name: string } | null> | null }
    | null;
};

export const HeroAndFriendsNamesDocument = gql`
  query HeroAndFriendsNames($episode: Episode) {
    hero(episode: $episode) {
      name
      friends {
        name
      }
    }
  }
`;

/**
 * __useHeroAndFriendsNamesQuery__
 *
 * To run a query within a React component, call `useHeroAndFriendsNamesQuery` and pass it any options that fit your needs.
 * When your component renders, `useHeroAndFriendsNamesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHeroAndFriendsNamesQuery({
 *   variables: {
 *      episode: // value for 'episode'
 *   },
 * });
 */
export function useHeroAndFriendsNamesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    HeroAndFriendsNamesQuery,
    HeroAndFriendsNamesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables>(
    HeroAndFriendsNamesDocument,
    options,
  );
}
export function useHeroAndFriendsNamesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    HeroAndFriendsNamesQuery,
    HeroAndFriendsNamesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables>(
    HeroAndFriendsNamesDocument,
    options,
  );
}
// @ts-ignore
export function useHeroAndFriendsNamesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    HeroAndFriendsNamesQuery,
    HeroAndFriendsNamesQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables>;
export function useHeroAndFriendsNamesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables>,
): Apollo.UseSuspenseQueryResult<
  HeroAndFriendsNamesQuery | undefined,
  HeroAndFriendsNamesQueryVariables
>;
export function useHeroAndFriendsNamesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<HeroAndFriendsNamesQuery, HeroAndFriendsNamesQueryVariables>(
    HeroAndFriendsNamesDocument,
    options,
  );
}
export type HeroAndFriendsNamesQueryHookResult = ReturnType<typeof useHeroAndFriendsNamesQuery>;
export type HeroAndFriendsNamesLazyQueryHookResult = ReturnType<
  typeof useHeroAndFriendsNamesLazyQuery
>;
export type HeroAndFriendsNamesSuspenseQueryHookResult = ReturnType<
  typeof useHeroAndFriendsNamesSuspenseQuery
>;
export type HeroAndFriendsNamesQueryResult = Apollo.QueryResult<
  HeroAndFriendsNamesQuery,
  HeroAndFriendsNamesQueryVariables
>;
