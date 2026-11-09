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
/** The input object sent when passing a color */
export type ColorInput = {
  blue: number;
  green: number;
  red: number;
};

/** The episodes in the Star Wars trilogy */
export type Episode =
  /** Star Wars Episode V: The Empire Strikes Back, released in 1980. */
  | 'EMPIRE'
  /** Star Wars Episode VI: Return of the Jedi, released in 1983. */
  | 'JEDI'
  /** Star Wars Episode IV: A New Hope, released in 1977. */
  | 'NEWHOPE';

/** The input object sent when someone is creating a new review */
export type ReviewInput = {
  /** Comment about the movie, optional */
  commentary?: string | null | undefined;
  /** Favorite color, optional */
  favoriteColor?: ColorInput | null | undefined;
  /** 0-5 stars */
  stars: number;
};

export type CreateReviewForEpisodeMutationVariables = Exact<{
  episode: Types.Episode;
  review: Types.ReviewInput;
}>;

export type CreateReviewForEpisodeMutation = {
  createReview: { stars: number; commentary: string | null } | null;
};

export const CreateReviewForEpisodeDocument = gql`
  mutation CreateReviewForEpisode($episode: Episode!, $review: ReviewInput!) {
    createReview(episode: $episode, review: $review) {
      stars
      commentary
    }
  }
`;
export type CreateReviewForEpisodeMutationFn = Apollo.MutationFunction<
  CreateReviewForEpisodeMutation,
  CreateReviewForEpisodeMutationVariables
>;

/**
 * __useCreateReviewForEpisodeMutation__
 *
 * To run a mutation, you first call `useCreateReviewForEpisodeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateReviewForEpisodeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createReviewForEpisodeMutation, { data, loading, error }] = useCreateReviewForEpisodeMutation({
 *   variables: {
 *      episode: // value for 'episode'
 *      review: // value for 'review'
 *   },
 * });
 */
export function useCreateReviewForEpisodeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateReviewForEpisodeMutation,
    CreateReviewForEpisodeMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateReviewForEpisodeMutation,
    CreateReviewForEpisodeMutationVariables
  >(CreateReviewForEpisodeDocument, options);
}
export type CreateReviewForEpisodeMutationHookResult = ReturnType<
  typeof useCreateReviewForEpisodeMutation
>;
export type CreateReviewForEpisodeMutationResult =
  Apollo.MutationResult<CreateReviewForEpisodeMutation>;
export type CreateReviewForEpisodeMutationOptions = Apollo.BaseMutationOptions<
  CreateReviewForEpisodeMutation,
  CreateReviewForEpisodeMutationVariables
>;
