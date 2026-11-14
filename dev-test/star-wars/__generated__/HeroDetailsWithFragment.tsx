import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
import * as Types from '../types.d.js';
import { HeroDetailsFragmentDoc } from './HeroDetailsFragment.js';

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

export type HeroDetailsWithFragmentQueryVariables = Exact<{
  episode?: Types.Episode | null | undefined;
}>;

export type HeroDetailsWithFragmentQuery = {
  hero:
    | { primaryFunction: string | null; name: string }
    | { height: number | null; name: string }
    | null;
};

export const HeroDetailsWithFragmentDocument = gql`
  query HeroDetailsWithFragment($episode: Episode) {
    hero(episode: $episode) {
      ...HeroDetails
    }
  }
  ${HeroDetailsFragmentDoc}
`;

/**
 * __useHeroDetailsWithFragmentQuery__
 *
 * To run a query within a React component, call `useHeroDetailsWithFragmentQuery` and pass it any options that fit your needs.
 * When your component renders, `useHeroDetailsWithFragmentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHeroDetailsWithFragmentQuery({
 *   variables: {
 *      episode: // value for 'episode'
 *   },
 * });
 */
export function useHeroDetailsWithFragmentQuery(
  baseOptions?: Apollo.QueryHookOptions<
    HeroDetailsWithFragmentQuery,
    HeroDetailsWithFragmentQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HeroDetailsWithFragmentQuery, HeroDetailsWithFragmentQueryVariables>(
    HeroDetailsWithFragmentDocument,
    options,
  );
}
export function useHeroDetailsWithFragmentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    HeroDetailsWithFragmentQuery,
    HeroDetailsWithFragmentQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HeroDetailsWithFragmentQuery, HeroDetailsWithFragmentQueryVariables>(
    HeroDetailsWithFragmentDocument,
    options,
  );
}
// @ts-ignore
export function useHeroDetailsWithFragmentSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    HeroDetailsWithFragmentQuery,
    HeroDetailsWithFragmentQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  HeroDetailsWithFragmentQuery,
  HeroDetailsWithFragmentQueryVariables
>;
export function useHeroDetailsWithFragmentSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        HeroDetailsWithFragmentQuery,
        HeroDetailsWithFragmentQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  HeroDetailsWithFragmentQuery | undefined,
  HeroDetailsWithFragmentQueryVariables
>;
export function useHeroDetailsWithFragmentSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        HeroDetailsWithFragmentQuery,
        HeroDetailsWithFragmentQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    HeroDetailsWithFragmentQuery,
    HeroDetailsWithFragmentQueryVariables
  >(HeroDetailsWithFragmentDocument, options);
}
export type HeroDetailsWithFragmentQueryHookResult = ReturnType<
  typeof useHeroDetailsWithFragmentQuery
>;
export type HeroDetailsWithFragmentLazyQueryHookResult = ReturnType<
  typeof useHeroDetailsWithFragmentLazyQuery
>;
export type HeroDetailsWithFragmentSuspenseQueryHookResult = ReturnType<
  typeof useHeroDetailsWithFragmentSuspenseQuery
>;
export type HeroDetailsWithFragmentQueryResult = Apollo.QueryResult<
  HeroDetailsWithFragmentQuery,
  HeroDetailsWithFragmentQueryVariables
>;
