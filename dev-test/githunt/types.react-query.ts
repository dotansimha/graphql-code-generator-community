import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';

/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };

function fetcher<TData, TVariables>(
  endpoint: string,
  requestInit: RequestInit,
  query: TypedDocumentString<unknown, unknown>,
  variables?: TVariables,
) {
  return async (): Promise<TData> => {
    const res = await fetch(endpoint, {
      method: 'POST',
      ...requestInit,
      body: JSON.stringify({ query, variables }),
    });

    const json = await res.json();

    if (json.errors) {
      const { message } = json.errors[0];

      throw new Error(message);
    }

    return json.data;
  };
}
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

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const CommentsPageCommentFragmentDoc = new TypedDocumentString(
  `
    fragment CommentsPageComment on Comment {
  id
  postedBy {
    login
    html_url
  }
  createdAt
  content
}
    `,
  { fragmentName: 'CommentsPageComment' },
);
export const VoteButtonsFragmentDoc = new TypedDocumentString(
  `
    fragment VoteButtons on Entry {
  score
  vote {
    vote_value
  }
}
    `,
  { fragmentName: 'VoteButtons' },
);
export const RepoInfoFragmentDoc = new TypedDocumentString(
  `
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
    `,
  { fragmentName: 'RepoInfo' },
);
export const FeedEntryFragmentDoc = new TypedDocumentString(
  `
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
fragment VoteButtons on Entry {
  score
  vote {
    vote_value
  }
}`,
  { fragmentName: 'FeedEntry' },
);
export const OnCommentAddedDocument = new TypedDocumentString(`
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
    `);
export const CommentDocument = new TypedDocumentString(`
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
    fragment CommentsPageComment on Comment {
  id
  postedBy {
    login
    html_url
  }
  createdAt
  content
}`);

export const useCommentQuery = <TData = CommentQuery, TError = unknown>(
  dataSource: { endpoint: string; fetchParams?: RequestInit },
  variables: CommentQueryVariables,
  options?: UseQueryOptions<CommentQuery, TError, TData>,
) => {
  return useQuery<CommentQuery, TError, TData>(
    ['Comment', variables],
    fetcher<CommentQuery, CommentQueryVariables>(
      dataSource.endpoint,
      dataSource.fetchParams || {},
      CommentDocument,
      variables,
    ),
    options,
  );
};

export const useInfiniteCommentQuery = <TData = CommentQuery, TError = unknown>(
  dataSource: { endpoint: string; fetchParams?: RequestInit },
  variables: CommentQueryVariables,
  options?: UseInfiniteQueryOptions<CommentQuery, TError, TData>,
) => {
  return useInfiniteQuery<CommentQuery, TError, TData>(
    ['Comment.infinite', variables],
    metaData =>
      fetcher<CommentQuery, CommentQueryVariables>(
        dataSource.endpoint,
        dataSource.fetchParams || {},
        CommentDocument,
        { ...variables, ...(metaData.pageParam ?? {}) },
      )(),
    options,
  );
};

export const CurrentUserForProfileDocument = new TypedDocumentString(`
    query CurrentUserForProfile {
  currentUser {
    login
    avatar_url
  }
}
    `);

export const useCurrentUserForProfileQuery = <TData = CurrentUserForProfileQuery, TError = unknown>(
  dataSource: { endpoint: string; fetchParams?: RequestInit },
  variables?: CurrentUserForProfileQueryVariables,
  options?: UseQueryOptions<CurrentUserForProfileQuery, TError, TData>,
) => {
  return useQuery<CurrentUserForProfileQuery, TError, TData>(
    variables === undefined ? ['CurrentUserForProfile'] : ['CurrentUserForProfile', variables],
    fetcher<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>(
      dataSource.endpoint,
      dataSource.fetchParams || {},
      CurrentUserForProfileDocument,
      variables,
    ),
    options,
  );
};

export const useInfiniteCurrentUserForProfileQuery = <
  TData = CurrentUserForProfileQuery,
  TError = unknown,
>(
  dataSource: { endpoint: string; fetchParams?: RequestInit },
  variables?: CurrentUserForProfileQueryVariables,
  options?: UseInfiniteQueryOptions<CurrentUserForProfileQuery, TError, TData>,
) => {
  return useInfiniteQuery<CurrentUserForProfileQuery, TError, TData>(
    variables === undefined
      ? ['CurrentUserForProfile.infinite']
      : ['CurrentUserForProfile.infinite', variables],
    metaData =>
      fetcher<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>(
        dataSource.endpoint,
        dataSource.fetchParams || {},
        CurrentUserForProfileDocument,
        { ...variables, ...(metaData.pageParam ?? {}) },
      )(),
    options,
  );
};

export const FeedDocument = new TypedDocumentString(`
    query Feed($type: FeedType!, $offset: Int, $limit: Int) {
  currentUser {
    login
  }
  feed(type: $type, offset: $offset, limit: $limit) {
    ...FeedEntry
  }
}
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
fragment VoteButtons on Entry {
  score
  vote {
    vote_value
  }
}`);

export const useFeedQuery = <TData = FeedQuery, TError = unknown>(
  dataSource: { endpoint: string; fetchParams?: RequestInit },
  variables: FeedQueryVariables,
  options?: UseQueryOptions<FeedQuery, TError, TData>,
) => {
  return useQuery<FeedQuery, TError, TData>(
    ['Feed', variables],
    fetcher<FeedQuery, FeedQueryVariables>(
      dataSource.endpoint,
      dataSource.fetchParams || {},
      FeedDocument,
      variables,
    ),
    options,
  );
};

export const useInfiniteFeedQuery = <TData = FeedQuery, TError = unknown>(
  dataSource: { endpoint: string; fetchParams?: RequestInit },
  variables: FeedQueryVariables,
  options?: UseInfiniteQueryOptions<FeedQuery, TError, TData>,
) => {
  return useInfiniteQuery<FeedQuery, TError, TData>(
    ['Feed.infinite', variables],
    metaData =>
      fetcher<FeedQuery, FeedQueryVariables>(
        dataSource.endpoint,
        dataSource.fetchParams || {},
        FeedDocument,
        { ...variables, ...(metaData.pageParam ?? {}) },
      )(),
    options,
  );
};

export const SubmitRepositoryDocument = new TypedDocumentString(`
    mutation submitRepository($repoFullName: String!) {
  submitRepository(repoFullName: $repoFullName) {
    createdAt
  }
}
    `);

export const useSubmitRepositoryMutation = <TError = unknown, TContext = unknown>(
  dataSource: { endpoint: string; fetchParams?: RequestInit },
  options?: UseMutationOptions<
    SubmitRepositoryMutation,
    TError,
    SubmitRepositoryMutationVariables,
    TContext
  >,
) => {
  return useMutation<SubmitRepositoryMutation, TError, SubmitRepositoryMutationVariables, TContext>(
    ['submitRepository'],
    (variables?: SubmitRepositoryMutationVariables) =>
      fetcher<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>(
        dataSource.endpoint,
        dataSource.fetchParams || {},
        SubmitRepositoryDocument,
        variables,
      )(),
    options,
  );
};

export const SubmitCommentDocument = new TypedDocumentString(`
    mutation submitComment($repoFullName: String!, $commentContent: String!) {
  submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
    ...CommentsPageComment
  }
}
    fragment CommentsPageComment on Comment {
  id
  postedBy {
    login
    html_url
  }
  createdAt
  content
}`);

export const useSubmitCommentMutation = <TError = unknown, TContext = unknown>(
  dataSource: { endpoint: string; fetchParams?: RequestInit },
  options?: UseMutationOptions<
    SubmitCommentMutation,
    TError,
    SubmitCommentMutationVariables,
    TContext
  >,
) => {
  return useMutation<SubmitCommentMutation, TError, SubmitCommentMutationVariables, TContext>(
    ['submitComment'],
    (variables?: SubmitCommentMutationVariables) =>
      fetcher<SubmitCommentMutation, SubmitCommentMutationVariables>(
        dataSource.endpoint,
        dataSource.fetchParams || {},
        SubmitCommentDocument,
        variables,
      )(),
    options,
  );
};

export const VoteDocument = new TypedDocumentString(`
    mutation vote($repoFullName: String!, $type: VoteType!) {
  vote(repoFullName: $repoFullName, type: $type) {
    score
    id
    vote {
      vote_value
    }
  }
}
    `);

export const useVoteMutation = <TError = unknown, TContext = unknown>(
  dataSource: { endpoint: string; fetchParams?: RequestInit },
  options?: UseMutationOptions<VoteMutation, TError, VoteMutationVariables, TContext>,
) => {
  return useMutation<VoteMutation, TError, VoteMutationVariables, TContext>(
    ['vote'],
    (variables?: VoteMutationVariables) =>
      fetcher<VoteMutation, VoteMutationVariables>(
        dataSource.endpoint,
        dataSource.fetchParams || {},
        VoteDocument,
        variables,
      )(),
    options,
  );
};
