import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
import { api } from '../../packages/plugins/typescript/rtk-query/tests/baseApi';

/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };

module.hot?.accept();
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
export const CurrentUserForProfileDocument = new TypedDocumentString(`
    query CurrentUserForProfile {
  currentUser {
    login
    avatar_url
  }
}
    `);
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
export const SubmitRepositoryDocument = new TypedDocumentString(`
    mutation submitRepository($repoFullName: String!) {
  submitRepository(repoFullName: $repoFullName) {
    createdAt
  }
}
    `);
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

const injectedRtkApi = api.injectEndpoints({
  overrideExisting: module.hot?.status() === 'apply',
  endpoints: build => ({
    Comment: build.query<CommentQuery, CommentQueryVariables>({
      query: variables => ({ document: CommentDocument as unknown as string, variables }),
    }),
    CurrentUserForProfile: build.query<
      CurrentUserForProfileQuery,
      CurrentUserForProfileQueryVariables | void
    >({
      query: variables => ({
        document: CurrentUserForProfileDocument as unknown as string,
        variables,
      }),
    }),
    Feed: build.query<FeedQuery, FeedQueryVariables>({
      query: variables => ({ document: FeedDocument as unknown as string, variables }),
    }),
    submitRepository: build.mutation<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>({
      query: variables => ({ document: SubmitRepositoryDocument as unknown as string, variables }),
    }),
    submitComment: build.mutation<SubmitCommentMutation, SubmitCommentMutationVariables>({
      query: variables => ({ document: SubmitCommentDocument as unknown as string, variables }),
    }),
    vote: build.mutation<VoteMutation, VoteMutationVariables>({
      query: variables => ({ document: VoteDocument as unknown as string, variables }),
    }),
  }),
});

export { injectedRtkApi as api };
export const {
  useCommentQuery,
  useLazyCommentQuery,
  useCurrentUserForProfileQuery,
  useLazyCurrentUserForProfileQuery,
  useFeedQuery,
  useLazyFeedQuery,
  useSubmitRepositoryMutation,
  useSubmitCommentMutation,
  useVoteMutation,
} = injectedRtkApi;
