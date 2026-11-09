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
export type TwoHeroesQueryVariables = Exact<{ [key: string]: never }>;

export type TwoHeroesQuery = {
  r2: { name: string } | { name: string } | null;
  luke: { name: string } | { name: string } | null;
};

export const TwoHeroesDocument = gql`
  query TwoHeroes {
    r2: hero {
      name
    }
    luke: hero(episode: EMPIRE) {
      name
    }
  }
`;

/**
 * __useTwoHeroesQuery__
 *
 * To run a query within a React component, call `useTwoHeroesQuery` and pass it any options that fit your needs.
 * When your component renders, `useTwoHeroesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTwoHeroesQuery({
 *   variables: {
 *   },
 * });
 */
export function useTwoHeroesQuery(
  baseOptions?: Apollo.QueryHookOptions<TwoHeroesQuery, TwoHeroesQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<TwoHeroesQuery, TwoHeroesQueryVariables>(TwoHeroesDocument, options);
}
export function useTwoHeroesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<TwoHeroesQuery, TwoHeroesQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<TwoHeroesQuery, TwoHeroesQueryVariables>(TwoHeroesDocument, options);
}
// @ts-ignore
export function useTwoHeroesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<TwoHeroesQuery, TwoHeroesQueryVariables>,
): Apollo.UseSuspenseQueryResult<TwoHeroesQuery, TwoHeroesQueryVariables>;
export function useTwoHeroesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<TwoHeroesQuery, TwoHeroesQueryVariables>,
): Apollo.UseSuspenseQueryResult<TwoHeroesQuery | undefined, TwoHeroesQueryVariables>;
export function useTwoHeroesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<TwoHeroesQuery, TwoHeroesQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<TwoHeroesQuery, TwoHeroesQueryVariables>(
    TwoHeroesDocument,
    options,
  );
}
export type TwoHeroesQueryHookResult = ReturnType<typeof useTwoHeroesQuery>;
export type TwoHeroesLazyQueryHookResult = ReturnType<typeof useTwoHeroesLazyQuery>;
export type TwoHeroesSuspenseQueryHookResult = ReturnType<typeof useTwoHeroesSuspenseQuery>;
export type TwoHeroesQueryResult = Apollo.QueryResult<TwoHeroesQuery, TwoHeroesQueryVariables>;
