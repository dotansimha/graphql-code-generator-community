import { ApolloError } from 'apollo-client';
import gql from 'graphql-tag';
import {
  createMutationFunction,
  createSmartQueryOptionsFunction,
  createSmartSubscriptionOptionsFunction,
} from 'vue-apollo-smart-ops';

/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };

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
 * To use a Smart Subscription within a Vue component, call `useOnCommentAddedSubscription` as the value for a `$subscribe` key
 * in the component's `apollo` config, passing any options required for the subscription.
 *
 * @param options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/core/ApolloClient/#ApolloClient.subscribe
 *
 * @example
 * {
 *   apollo: {
 *     $subscribe: {
 *       onCommentAdded: useOnCommentAddedSubscription({
 *         variables: {
 *           repoFullName: // value for 'repoFullName'
 *         },
 *         loadingKey: 'loading',
 *         fetchPolicy: 'no-cache',
 *       }),
 *     },
 *   }
 * }
 */
export const useOnCommentAddedSubscription = createSmartSubscriptionOptionsFunction<
  OnCommentAddedSubscription,
  OnCommentAddedSubscriptionVariables,
  ApolloError
>(OnCommentAddedDocument);

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
 * To use a Smart Query within a Vue component, call `useCommentQuery` as the value for a query key
 * in the component's `apollo` config, passing any options required for the query.
 *
 * @param options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/core/ApolloClient/#ApolloClient.query
 *
 * @example
 * {
 *   apollo: {
 *     comment: useCommentQuery({
 *       variables: {
 *         repoFullName: // value for 'repoFullName'
 *         limit: // value for 'limit'
 *         offset: // value for 'offset'
 *       },
 *       loadingKey: 'loading',
 *       fetchPolicy: 'no-cache',
 *     }),
 *   }
 * }
 */
export const useCommentQuery = createSmartQueryOptionsFunction<
  CommentQuery,
  CommentQueryVariables,
  ApolloError
>(CommentDocument);

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
 * To use a Smart Query within a Vue component, call `useCurrentUserForProfileQuery` as the value for a query key
 * in the component's `apollo` config, passing any options required for the query.
 *
 * @param options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/core/ApolloClient/#ApolloClient.query
 *
 * @example
 * {
 *   apollo: {
 *     currentUserForProfile: useCurrentUserForProfileQuery({
 *       variables: {},
 *       loadingKey: 'loading',
 *       fetchPolicy: 'no-cache',
 *     }),
 *   }
 * }
 */
export const useCurrentUserForProfileQuery = createSmartQueryOptionsFunction<
  CurrentUserForProfileQuery,
  CurrentUserForProfileQueryVariables,
  ApolloError
>(CurrentUserForProfileDocument);

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
 * To use a Smart Query within a Vue component, call `useFeedQuery` as the value for a query key
 * in the component's `apollo` config, passing any options required for the query.
 *
 * @param options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/core/ApolloClient/#ApolloClient.query
 *
 * @example
 * {
 *   apollo: {
 *     feed: useFeedQuery({
 *       variables: {
 *         type: // value for 'type'
 *         offset: // value for 'offset'
 *         limit: // value for 'limit'
 *       },
 *       loadingKey: 'loading',
 *       fetchPolicy: 'no-cache',
 *     }),
 *   }
 * }
 */
export const useFeedQuery = createSmartQueryOptionsFunction<
  FeedQuery,
  FeedQueryVariables,
  ApolloError
>(FeedDocument);

export const SubmitRepositoryDocument = gql`
  mutation submitRepository($repoFullName: String!) {
    submitRepository(repoFullName: $repoFullName) {
      createdAt
    }
  }
`;

/**
 * __submitRepositoryMutation__
 *
 * To run a mutation, you call `submitRepositoryMutation` within a Vue component and pass it
 * your Vue app instance along with any options that fit your needs.
 *
 * @param app, a reference to your Vue app instance (which must have a `$apollo` property)
 * @param options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/core/ApolloClient/#ApolloClient.mutate
 * @param client (optional), which can be an instance of `DollarApollo` or the `mutate()` function provided by an `<ApolloMutation>` component
 *
 * @example
 * const { success, data, errors } = submitRepositoryMutation(this, {
 *   variables: {
 *     repoFullName: // value for 'repoFullName'
 *   },
 * });
 */
export const submitRepositoryMutation = createMutationFunction<
  SubmitRepositoryMutation,
  SubmitRepositoryMutationVariables,
  ApolloError
>(SubmitRepositoryDocument);

export const SubmitCommentDocument = gql`
  mutation submitComment($repoFullName: String!, $commentContent: String!) {
    submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
      ...CommentsPageComment
    }
  }
  ${CommentsPageCommentFragmentDoc}
`;

/**
 * __submitCommentMutation__
 *
 * To run a mutation, you call `submitCommentMutation` within a Vue component and pass it
 * your Vue app instance along with any options that fit your needs.
 *
 * @param app, a reference to your Vue app instance (which must have a `$apollo` property)
 * @param options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/core/ApolloClient/#ApolloClient.mutate
 * @param client (optional), which can be an instance of `DollarApollo` or the `mutate()` function provided by an `<ApolloMutation>` component
 *
 * @example
 * const { success, data, errors } = submitCommentMutation(this, {
 *   variables: {
 *     repoFullName: // value for 'repoFullName'
 *     commentContent: // value for 'commentContent'
 *   },
 * });
 */
export const submitCommentMutation = createMutationFunction<
  SubmitCommentMutation,
  SubmitCommentMutationVariables,
  ApolloError
>(SubmitCommentDocument);

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
 * __voteMutation__
 *
 * To run a mutation, you call `voteMutation` within a Vue component and pass it
 * your Vue app instance along with any options that fit your needs.
 *
 * @param app, a reference to your Vue app instance (which must have a `$apollo` property)
 * @param options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/core/ApolloClient/#ApolloClient.mutate
 * @param client (optional), which can be an instance of `DollarApollo` or the `mutate()` function provided by an `<ApolloMutation>` component
 *
 * @example
 * const { success, data, errors } = voteMutation(this, {
 *   variables: {
 *     repoFullName: // value for 'repoFullName'
 *     type: // value for 'type'
 *   },
 * });
 */
export const voteMutation = createMutationFunction<
  VoteMutation,
  VoteMutationVariables,
  ApolloError
>(VoteDocument);
