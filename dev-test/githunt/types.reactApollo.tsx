import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };

const defaultOptions = {} as const;
/** A list of options for the sort order of the feed */
export type FeedType =
  /** Sort by a combination of freshness and score, using Reddit's algorithm */
  | 'HOT'
  /** Newest entries first */
  | 'NEW'
  /** Highest score entries first */
  | 'TOP';

/** The type of vote to record, when submitting a vote */
export type VoteType = 'CANCEL' | 'DOWN' | 'UP';

export type OnCommentAddedSubscriptionVariables = Exact<{
  repoFullName: string;
}>;

export type OnCommentAddedSubscription = {
  commentAdded: {
    id: number;
    createdAt: number;
    content: string;
    postedBy: { login: string; html_url: string };
  } | null;
};

export type CommentQueryVariables = Exact<{
  repoFullName: string;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
}>;

export type CommentQuery = {
  currentUser: { login: string; html_url: string } | null;
  entry: {
    id: number;
    createdAt: number;
    commentCount: number;
    postedBy: { login: string; html_url: string };
    comments: Array<{
      id: number;
      createdAt: number;
      content: string;
      postedBy: { login: string; html_url: string };
    } | null>;
    repository: {
      description: string | null;
      open_issues_count: number | null;
      stargazers_count: number;
      full_name: string;
      html_url: string;
    };
  } | null;
};

export type CommentsPageCommentFragment = {
  id: number;
  createdAt: number;
  content: string;
  postedBy: { login: string; html_url: string };
};

export type CurrentUserForProfileQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentUserForProfileQuery = {
  currentUser: { login: string; avatar_url: string } | null;
};

export type FeedEntryFragment = {
  id: number;
  commentCount: number;
  score: number;
  createdAt: number;
  repository: {
    full_name: string;
    html_url: string;
    description: string | null;
    stargazers_count: number;
    open_issues_count: number | null;
    owner: { avatar_url: string } | null;
  };
  vote: { vote_value: number };
  postedBy: { html_url: string; login: string };
};

export type FeedQueryVariables = Exact<{
  type: FeedType;
  offset?: number | null | undefined;
  limit?: number | null | undefined;
}>;

export type FeedQuery = {
  currentUser: { login: string } | null;
  feed: Array<{
    id: number;
    commentCount: number;
    score: number;
    createdAt: number;
    repository: {
      full_name: string;
      html_url: string;
      description: string | null;
      stargazers_count: number;
      open_issues_count: number | null;
      owner: { avatar_url: string } | null;
    };
    vote: { vote_value: number };
    postedBy: { html_url: string; login: string };
  } | null> | null;
};

export type SubmitRepositoryMutationVariables = Exact<{
  repoFullName: string;
}>;

export type SubmitRepositoryMutation = { submitRepository: { createdAt: number } | null };

export type RepoInfoFragment = {
  createdAt: number;
  repository: {
    description: string | null;
    stargazers_count: number;
    open_issues_count: number | null;
  };
  postedBy: { html_url: string; login: string };
};

export type SubmitCommentMutationVariables = Exact<{
  repoFullName: string;
  commentContent: string;
}>;

export type SubmitCommentMutation = {
  submitComment: {
    id: number;
    createdAt: number;
    content: string;
    postedBy: { login: string; html_url: string };
  } | null;
};

export type VoteButtonsFragment = { score: number; vote: { vote_value: number } };

export type VoteMutationVariables = Exact<{
  repoFullName: string;
  type: VoteType;
}>;

export type VoteMutation = {
  vote: { score: number; id: number; vote: { vote_value: number } } | null;
};

export const CommentsPageCommentFragmentDoc = gql`
  fragment CommentsPageComment on Comment {
    id
    postedBy {
      login
      html_url
    }
    createdAt
    content
  }
`;
export const VoteButtonsFragmentDoc = gql`
  fragment VoteButtons on Entry {
    score
    vote {
      vote_value
    }
  }
`;
export const RepoInfoFragmentDoc = gql`
  fragment RepoInfo on Entry {
    createdAt
    repository {
      description
      stargazers_count
      open_issues_count
    }
    postedBy {
      html_url
      login
    }
  }
`;
export const FeedEntryFragmentDoc = gql`
  fragment FeedEntry on Entry {
    id
    commentCount
    repository {
      full_name
      html_url
      owner {
        avatar_url
      }
    }
    ...VoteButtons
    ...RepoInfo
  }
`;
export const OnCommentAddedDocument = gql`
  subscription onCommentAdded($repoFullName: String!) {
    commentAdded(repoFullName: $repoFullName) {
      id
      postedBy {
        login
        html_url
      }
      createdAt
      content
    }
  }
`;

/**
 * __useOnCommentAddedSubscription__
 *
 * To run a query within a React component, call `useOnCommentAddedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnCommentAddedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnCommentAddedSubscription({
 *   variables: {
 *      repoFullName: // value for 'repoFullName'
 *   },
 * });
 */
export function useOnCommentAddedSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
    OnCommentAddedSubscription,
    OnCommentAddedSubscriptionVariables
  > &
    ({ variables: OnCommentAddedSubscriptionVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables>(
    OnCommentAddedDocument,
    options,
  );
}
export type OnCommentAddedSubscriptionHookResult = ReturnType<typeof useOnCommentAddedSubscription>;
export type OnCommentAddedSubscriptionResult =
  Apollo.SubscriptionResult<OnCommentAddedSubscription>;
export const CommentDocument = gql`
  query Comment($repoFullName: String!, $limit: Int, $offset: Int) {
    currentUser {
      login
      html_url
    }
    entry(repoFullName: $repoFullName) {
      id
      postedBy {
        login
        html_url
      }
      createdAt
      comments(limit: $limit, offset: $offset) {
        ...CommentsPageComment
      }
      commentCount
      repository {
        full_name
        html_url
        ... on Repository {
          description
          open_issues_count
          stargazers_count
        }
      }
    }
  }
  ${CommentsPageCommentFragmentDoc}
`;

/**
 * __useCommentQuery__
 *
 * To run a query within a React component, call `useCommentQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommentQuery({
 *   variables: {
 *      repoFullName: // value for 'repoFullName'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useCommentQuery(
  baseOptions: Apollo.QueryHookOptions<CommentQuery, CommentQueryVariables> &
    ({ variables: CommentQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<CommentQuery, CommentQueryVariables>(CommentDocument, options);
}
export function useCommentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<CommentQuery, CommentQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<CommentQuery, CommentQueryVariables>(CommentDocument, options);
}
// @ts-ignore
export function useCommentSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<CommentQuery, CommentQueryVariables>,
): Apollo.UseSuspenseQueryResult<CommentQuery, CommentQueryVariables>;
export function useCommentSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<CommentQuery, CommentQueryVariables>,
): Apollo.UseSuspenseQueryResult<CommentQuery | undefined, CommentQueryVariables>;
export function useCommentSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<CommentQuery, CommentQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<CommentQuery, CommentQueryVariables>(CommentDocument, options);
}
export type CommentQueryHookResult = ReturnType<typeof useCommentQuery>;
export type CommentLazyQueryHookResult = ReturnType<typeof useCommentLazyQuery>;
export type CommentSuspenseQueryHookResult = ReturnType<typeof useCommentSuspenseQuery>;
export type CommentQueryResult = Apollo.QueryResult<CommentQuery, CommentQueryVariables>;
export const CurrentUserForProfileDocument = gql`
  query CurrentUserForProfile {
    currentUser {
      login
      avatar_url
    }
  }
`;

/**
 * __useCurrentUserForProfileQuery__
 *
 * To run a query within a React component, call `useCurrentUserForProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useCurrentUserForProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCurrentUserForProfileQuery({
 *   variables: {
 *   },
 * });
 */
export function useCurrentUserForProfileQuery(
  baseOptions?: Apollo.QueryHookOptions<
    CurrentUserForProfileQuery,
    CurrentUserForProfileQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>(
    CurrentUserForProfileDocument,
    options,
  );
}
export function useCurrentUserForProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CurrentUserForProfileQuery,
    CurrentUserForProfileQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>(
    CurrentUserForProfileDocument,
    options,
  );
}
// @ts-ignore
export function useCurrentUserForProfileSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    CurrentUserForProfileQuery,
    CurrentUserForProfileQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>;
export function useCurrentUserForProfileSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        CurrentUserForProfileQuery,
        CurrentUserForProfileQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  CurrentUserForProfileQuery | undefined,
  CurrentUserForProfileQueryVariables
>;
export function useCurrentUserForProfileSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        CurrentUserForProfileQuery,
        CurrentUserForProfileQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>(
    CurrentUserForProfileDocument,
    options,
  );
}
export type CurrentUserForProfileQueryHookResult = ReturnType<typeof useCurrentUserForProfileQuery>;
export type CurrentUserForProfileLazyQueryHookResult = ReturnType<
  typeof useCurrentUserForProfileLazyQuery
>;
export type CurrentUserForProfileSuspenseQueryHookResult = ReturnType<
  typeof useCurrentUserForProfileSuspenseQuery
>;
export type CurrentUserForProfileQueryResult = Apollo.QueryResult<
  CurrentUserForProfileQuery,
  CurrentUserForProfileQueryVariables
>;
export const FeedDocument = gql`
  query Feed($type: FeedType!, $offset: Int, $limit: Int) {
    currentUser {
      login
    }
    feed(type: $type, offset: $offset, limit: $limit) {
      ...FeedEntry
    }
  }
  ${FeedEntryFragmentDoc}
  ${VoteButtonsFragmentDoc}
  ${RepoInfoFragmentDoc}
`;

/**
 * __useFeedQuery__
 *
 * To run a query within a React component, call `useFeedQuery` and pass it any options that fit your needs.
 * When your component renders, `useFeedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFeedQuery({
 *   variables: {
 *      type: // value for 'type'
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useFeedQuery(
  baseOptions: Apollo.QueryHookOptions<FeedQuery, FeedQueryVariables> &
    ({ variables: FeedQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<FeedQuery, FeedQueryVariables>(FeedDocument, options);
}
export function useFeedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<FeedQuery, FeedQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<FeedQuery, FeedQueryVariables>(FeedDocument, options);
}
// @ts-ignore
export function useFeedSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<FeedQuery, FeedQueryVariables>,
): Apollo.UseSuspenseQueryResult<FeedQuery, FeedQueryVariables>;
export function useFeedSuspenseQuery(
  baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FeedQuery, FeedQueryVariables>,
): Apollo.UseSuspenseQueryResult<FeedQuery | undefined, FeedQueryVariables>;
export function useFeedSuspenseQuery(
  baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FeedQuery, FeedQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<FeedQuery, FeedQueryVariables>(FeedDocument, options);
}
export type FeedQueryHookResult = ReturnType<typeof useFeedQuery>;
export type FeedLazyQueryHookResult = ReturnType<typeof useFeedLazyQuery>;
export type FeedSuspenseQueryHookResult = ReturnType<typeof useFeedSuspenseQuery>;
export type FeedQueryResult = Apollo.QueryResult<FeedQuery, FeedQueryVariables>;
export const SubmitRepositoryDocument = gql`
  mutation submitRepository($repoFullName: String!) {
    submitRepository(repoFullName: $repoFullName) {
      createdAt
    }
  }
`;
export type SubmitRepositoryMutationFn = Apollo.MutationFunction<
  SubmitRepositoryMutation,
  SubmitRepositoryMutationVariables
>;

/**
 * __useSubmitRepositoryMutation__
 *
 * To run a mutation, you first call `useSubmitRepositoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitRepositoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitRepositoryMutation, { data, loading, error }] = useSubmitRepositoryMutation({
 *   variables: {
 *      repoFullName: // value for 'repoFullName'
 *   },
 * });
 */
export function useSubmitRepositoryMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SubmitRepositoryMutation,
    SubmitRepositoryMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>(
    SubmitRepositoryDocument,
    options,
  );
}
export type SubmitRepositoryMutationHookResult = ReturnType<typeof useSubmitRepositoryMutation>;
export type SubmitRepositoryMutationResult = Apollo.MutationResult<SubmitRepositoryMutation>;
export type SubmitRepositoryMutationOptions = Apollo.BaseMutationOptions<
  SubmitRepositoryMutation,
  SubmitRepositoryMutationVariables
>;
export const SubmitCommentDocument = gql`
  mutation submitComment($repoFullName: String!, $commentContent: String!) {
    submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
      ...CommentsPageComment
    }
  }
  ${CommentsPageCommentFragmentDoc}
`;
export type SubmitCommentMutationFn = Apollo.MutationFunction<
  SubmitCommentMutation,
  SubmitCommentMutationVariables
>;

/**
 * __useSubmitCommentMutation__
 *
 * To run a mutation, you first call `useSubmitCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitCommentMutation, { data, loading, error }] = useSubmitCommentMutation({
 *   variables: {
 *      repoFullName: // value for 'repoFullName'
 *      commentContent: // value for 'commentContent'
 *   },
 * });
 */
export function useSubmitCommentMutation(
  baseOptions?: Apollo.MutationHookOptions<SubmitCommentMutation, SubmitCommentMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<SubmitCommentMutation, SubmitCommentMutationVariables>(
    SubmitCommentDocument,
    options,
  );
}
export type SubmitCommentMutationHookResult = ReturnType<typeof useSubmitCommentMutation>;
export type SubmitCommentMutationResult = Apollo.MutationResult<SubmitCommentMutation>;
export type SubmitCommentMutationOptions = Apollo.BaseMutationOptions<
  SubmitCommentMutation,
  SubmitCommentMutationVariables
>;
export const VoteDocument = gql`
  mutation vote($repoFullName: String!, $type: VoteType!) {
    vote(repoFullName: $repoFullName, type: $type) {
      score
      id
      vote {
        vote_value
      }
    }
  }
`;
export type VoteMutationFn = Apollo.MutationFunction<VoteMutation, VoteMutationVariables>;

/**
 * __useVoteMutation__
 *
 * To run a mutation, you first call `useVoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useVoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [voteMutation, { data, loading, error }] = useVoteMutation({
 *   variables: {
 *      repoFullName: // value for 'repoFullName'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useVoteMutation(
  baseOptions?: Apollo.MutationHookOptions<VoteMutation, VoteMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<VoteMutation, VoteMutationVariables>(VoteDocument, options);
}
export type VoteMutationHookResult = ReturnType<typeof useVoteMutation>;
export type VoteMutationResult = Apollo.MutationResult<VoteMutation>;
export type VoteMutationOptions = Apollo.BaseMutationOptions<VoteMutation, VoteMutationVariables>;
