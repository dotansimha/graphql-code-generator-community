import gql from 'graphql-tag';
import * as VueApolloComposable from '@vue/apollo-composable';
import * as VueCompositionApi from '@vue/composition-api';

/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };

export type ReactiveFunction<TParam> = () => TParam;
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
 * To run a query within a Vue component, call `useOnCommentAddedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnCommentAddedSubscription` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the subscription
 * @param options that will be passed into the subscription, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/subscription.html#options;
 *
 * @example
 * const { result, loading, error } = useOnCommentAddedSubscription({
 *   repoFullName: // value for 'repoFullName'
 * });
 */
export function useOnCommentAddedSubscription(
  variables:
    | OnCommentAddedSubscriptionVariables
    | VueCompositionApi.Ref<OnCommentAddedSubscriptionVariables>
    | ReactiveFunction<OnCommentAddedSubscriptionVariables>,
  options:
    | VueApolloComposable.UseSubscriptionOptions<
        OnCommentAddedSubscription,
        OnCommentAddedSubscriptionVariables
      >
    | VueCompositionApi.Ref<
        VueApolloComposable.UseSubscriptionOptions<
          OnCommentAddedSubscription,
          OnCommentAddedSubscriptionVariables
        >
      >
    | ReactiveFunction<
        VueApolloComposable.UseSubscriptionOptions<
          OnCommentAddedSubscription,
          OnCommentAddedSubscriptionVariables
        >
      > = {},
) {
  return VueApolloComposable.useSubscription<
    OnCommentAddedSubscription,
    OnCommentAddedSubscriptionVariables
  >(OnCommentAddedDocument, variables, options);
}
export type OnCommentAddedSubscriptionCompositionFunctionResult =
  VueApolloComposable.UseSubscriptionReturn<
    OnCommentAddedSubscription,
    OnCommentAddedSubscriptionVariables
  >;
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
 * To run a query within a Vue component, call `useCommentQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommentQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useCommentQuery({
 *   repoFullName: // value for 'repoFullName'
 *   limit: // value for 'limit'
 *   offset: // value for 'offset'
 * });
 */
export function useCommentQuery(
  variables:
    | CommentQueryVariables
    | VueCompositionApi.Ref<CommentQueryVariables>
    | ReactiveFunction<CommentQueryVariables>,
  options:
    | VueApolloComposable.UseQueryOptions<CommentQuery, CommentQueryVariables>
    | VueCompositionApi.Ref<
        VueApolloComposable.UseQueryOptions<CommentQuery, CommentQueryVariables>
      >
    | ReactiveFunction<
        VueApolloComposable.UseQueryOptions<CommentQuery, CommentQueryVariables>
      > = {},
) {
  return VueApolloComposable.useQuery<CommentQuery, CommentQueryVariables>(
    CommentDocument,
    variables,
    options,
  );
}
export function useCommentLazyQuery(
  variables?:
    | CommentQueryVariables
    | VueCompositionApi.Ref<CommentQueryVariables>
    | ReactiveFunction<CommentQueryVariables>,
  options:
    | VueApolloComposable.UseQueryOptions<CommentQuery, CommentQueryVariables>
    | VueCompositionApi.Ref<
        VueApolloComposable.UseQueryOptions<CommentQuery, CommentQueryVariables>
      >
    | ReactiveFunction<
        VueApolloComposable.UseQueryOptions<CommentQuery, CommentQueryVariables>
      > = {},
) {
  return VueApolloComposable.useLazyQuery<CommentQuery, CommentQueryVariables>(
    CommentDocument,
    variables,
    options,
  );
}
export type CommentQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<
  CommentQuery,
  CommentQueryVariables
>;
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
 * To run a query within a Vue component, call `useCurrentUserForProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useCurrentUserForProfileQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useCurrentUserForProfileQuery();
 */
export function useCurrentUserForProfileQuery(
  options:
    | VueApolloComposable.UseQueryOptions<
        CurrentUserForProfileQuery,
        CurrentUserForProfileQueryVariables
      >
    | VueCompositionApi.Ref<
        VueApolloComposable.UseQueryOptions<
          CurrentUserForProfileQuery,
          CurrentUserForProfileQueryVariables
        >
      >
    | ReactiveFunction<
        VueApolloComposable.UseQueryOptions<
          CurrentUserForProfileQuery,
          CurrentUserForProfileQueryVariables
        >
      > = {},
) {
  return VueApolloComposable.useQuery<
    CurrentUserForProfileQuery,
    CurrentUserForProfileQueryVariables
  >(CurrentUserForProfileDocument, {}, options);
}
export function useCurrentUserForProfileLazyQuery(
  options:
    | VueApolloComposable.UseQueryOptions<
        CurrentUserForProfileQuery,
        CurrentUserForProfileQueryVariables
      >
    | VueCompositionApi.Ref<
        VueApolloComposable.UseQueryOptions<
          CurrentUserForProfileQuery,
          CurrentUserForProfileQueryVariables
        >
      >
    | ReactiveFunction<
        VueApolloComposable.UseQueryOptions<
          CurrentUserForProfileQuery,
          CurrentUserForProfileQueryVariables
        >
      > = {},
) {
  return VueApolloComposable.useLazyQuery<
    CurrentUserForProfileQuery,
    CurrentUserForProfileQueryVariables
  >(CurrentUserForProfileDocument, {}, options);
}
export type CurrentUserForProfileQueryCompositionFunctionResult =
  VueApolloComposable.UseQueryReturn<
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
 * To run a query within a Vue component, call `useFeedQuery` and pass it any options that fit your needs.
 * When your component renders, `useFeedQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useFeedQuery({
 *   type: // value for 'type'
 *   offset: // value for 'offset'
 *   limit: // value for 'limit'
 * });
 */
export function useFeedQuery(
  variables:
    | FeedQueryVariables
    | VueCompositionApi.Ref<FeedQueryVariables>
    | ReactiveFunction<FeedQueryVariables>,
  options:
    | VueApolloComposable.UseQueryOptions<FeedQuery, FeedQueryVariables>
    | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<FeedQuery, FeedQueryVariables>>
    | ReactiveFunction<VueApolloComposable.UseQueryOptions<FeedQuery, FeedQueryVariables>> = {},
) {
  return VueApolloComposable.useQuery<FeedQuery, FeedQueryVariables>(
    FeedDocument,
    variables,
    options,
  );
}
export function useFeedLazyQuery(
  variables?:
    | FeedQueryVariables
    | VueCompositionApi.Ref<FeedQueryVariables>
    | ReactiveFunction<FeedQueryVariables>,
  options:
    | VueApolloComposable.UseQueryOptions<FeedQuery, FeedQueryVariables>
    | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<FeedQuery, FeedQueryVariables>>
    | ReactiveFunction<VueApolloComposable.UseQueryOptions<FeedQuery, FeedQueryVariables>> = {},
) {
  return VueApolloComposable.useLazyQuery<FeedQuery, FeedQueryVariables>(
    FeedDocument,
    variables,
    options,
  );
}
export type FeedQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<
  FeedQuery,
  FeedQueryVariables
>;
export const SubmitRepositoryDocument = gql`
  mutation submitRepository($repoFullName: String!) {
    submitRepository(repoFullName: $repoFullName) {
      createdAt
    }
  }
`;

/**
 * __useSubmitRepositoryMutation__
 *
 * To run a mutation, you first call `useSubmitRepositoryMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useSubmitRepositoryMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useSubmitRepositoryMutation({
 *   variables: {
 *     repoFullName: // value for 'repoFullName'
 *   },
 * });
 */
export function useSubmitRepositoryMutation(
  options:
    | VueApolloComposable.UseMutationOptions<
        SubmitRepositoryMutation,
        SubmitRepositoryMutationVariables
      >
    | ReactiveFunction<
        VueApolloComposable.UseMutationOptions<
          SubmitRepositoryMutation,
          SubmitRepositoryMutationVariables
        >
      > = {},
) {
  return VueApolloComposable.useMutation<
    SubmitRepositoryMutation,
    SubmitRepositoryMutationVariables
  >(SubmitRepositoryDocument, options);
}
export type SubmitRepositoryMutationCompositionFunctionResult =
  VueApolloComposable.UseMutationReturn<
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

/**
 * __useSubmitCommentMutation__
 *
 * To run a mutation, you first call `useSubmitCommentMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useSubmitCommentMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useSubmitCommentMutation({
 *   variables: {
 *     repoFullName: // value for 'repoFullName'
 *     commentContent: // value for 'commentContent'
 *   },
 * });
 */
export function useSubmitCommentMutation(
  options:
    | VueApolloComposable.UseMutationOptions<SubmitCommentMutation, SubmitCommentMutationVariables>
    | ReactiveFunction<
        VueApolloComposable.UseMutationOptions<
          SubmitCommentMutation,
          SubmitCommentMutationVariables
        >
      > = {},
) {
  return VueApolloComposable.useMutation<SubmitCommentMutation, SubmitCommentMutationVariables>(
    SubmitCommentDocument,
    options,
  );
}
export type SubmitCommentMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<
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

/**
 * __useVoteMutation__
 *
 * To run a mutation, you first call `useVoteMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useVoteMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useVoteMutation({
 *   variables: {
 *     repoFullName: // value for 'repoFullName'
 *     type: // value for 'type'
 *   },
 * });
 */
export function useVoteMutation(
  options:
    | VueApolloComposable.UseMutationOptions<VoteMutation, VoteMutationVariables>
    | ReactiveFunction<
        VueApolloComposable.UseMutationOptions<VoteMutation, VoteMutationVariables>
      > = {},
) {
  return VueApolloComposable.useMutation<VoteMutation, VoteMutationVariables>(
    VoteDocument,
    options,
  );
}
export type VoteMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<
  VoteMutation,
  VoteMutationVariables
>;
