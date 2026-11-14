import { ExecutionResult, GraphQLSchema } from 'graphql';
import { compileQuery, CompilerOptions, isCompiledQuery } from 'graphql-jit';
import gql from 'graphql-tag';
import { AggregateError, isAsyncIterable, mapAsyncIterator } from '@graphql-tools/utils';

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
export const CurrentUserForProfileDocument = gql`
  query CurrentUserForProfile {
    currentUser {
      login
      avatar_url
    }
  }
`;
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
export const SubmitRepositoryDocument = gql`
  mutation submitRepository($repoFullName: String!) {
    submitRepository(repoFullName: $repoFullName) {
      createdAt
    }
  }
`;
export const SubmitCommentDocument = gql`
  mutation submitComment($repoFullName: String!, $commentContent: String!) {
    submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
      ...CommentsPageComment
    }
  }
  ${CommentsPageCommentFragmentDoc}
`;
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
async function handleSubscriptionResult<T>(
  resultIterator: AsyncIterableIterator<ExecutionResult> | ExecutionResult,
  operationName: string,
) {
  if (isAsyncIterable(resultIterator)) {
    return mapAsyncIterator<any, T>(resultIterator, result =>
      handleExecutionResult(result, operationName),
    );
  } else {
    return handleExecutionResult<T>(resultIterator, operationName);
  }
}
function handleExecutionResult<T>(result: ExecutionResult, operationName: string) {
  if (result.errors) {
    const originalErrors = result.errors.map(error => error.originalError || error);
    throw new AggregateError(
      originalErrors,
      `Failed to execute ${operationName}: \n\t${originalErrors.join('\n\t')}`,
    );
  }
  return result.data as unknown as T;
}
export interface SdkOptions<TGlobalContext = any, TGlobalRoot = any> {
  globalContext?: TGlobalContext;
  globalRoot?: TGlobalRoot;
  jitOptions?: Partial<CompilerOptions>;
}
export function getSdk<
  TGlobalContext = any,
  TGlobalRoot = any,
  TOperationContext = any,
  TOperationRoot = any,
>(
  schema: GraphQLSchema,
  { globalContext, globalRoot, jitOptions = {} }: SdkOptions<TGlobalContext, TGlobalRoot> = {},
) {
  const onCommentAddedCompiled = compileQuery(
    schema,
    OnCommentAddedDocument,
    'onCommentAdded',
    jitOptions,
  );
  if (!isCompiledQuery(onCommentAddedCompiled)) {
    const originalErrors =
      onCommentAddedCompiled?.errors?.map(error => error.originalError || error) || [];
    throw new AggregateError(
      originalErrors,
      `Failed to compile onCommentAdded: \n\t${originalErrors.join('\n\t')}`,
    );
  }

  const CommentCompiled = compileQuery(schema, CommentDocument, 'Comment', jitOptions);
  if (!isCompiledQuery(CommentCompiled)) {
    const originalErrors =
      CommentCompiled?.errors?.map(error => error.originalError || error) || [];
    throw new AggregateError(
      originalErrors,
      `Failed to compile Comment: \n\t${originalErrors.join('\n\t')}`,
    );
  }

  const CurrentUserForProfileCompiled = compileQuery(
    schema,
    CurrentUserForProfileDocument,
    'CurrentUserForProfile',
    jitOptions,
  );
  if (!isCompiledQuery(CurrentUserForProfileCompiled)) {
    const originalErrors =
      CurrentUserForProfileCompiled?.errors?.map(error => error.originalError || error) || [];
    throw new AggregateError(
      originalErrors,
      `Failed to compile CurrentUserForProfile: \n\t${originalErrors.join('\n\t')}`,
    );
  }

  const FeedCompiled = compileQuery(schema, FeedDocument, 'Feed', jitOptions);
  if (!isCompiledQuery(FeedCompiled)) {
    const originalErrors = FeedCompiled?.errors?.map(error => error.originalError || error) || [];
    throw new AggregateError(
      originalErrors,
      `Failed to compile Feed: \n\t${originalErrors.join('\n\t')}`,
    );
  }

  const submitRepositoryCompiled = compileQuery(
    schema,
    SubmitRepositoryDocument,
    'submitRepository',
    jitOptions,
  );
  if (!isCompiledQuery(submitRepositoryCompiled)) {
    const originalErrors =
      submitRepositoryCompiled?.errors?.map(error => error.originalError || error) || [];
    throw new AggregateError(
      originalErrors,
      `Failed to compile submitRepository: \n\t${originalErrors.join('\n\t')}`,
    );
  }

  const submitCommentCompiled = compileQuery(
    schema,
    SubmitCommentDocument,
    'submitComment',
    jitOptions,
  );
  if (!isCompiledQuery(submitCommentCompiled)) {
    const originalErrors =
      submitCommentCompiled?.errors?.map(error => error.originalError || error) || [];
    throw new AggregateError(
      originalErrors,
      `Failed to compile submitComment: \n\t${originalErrors.join('\n\t')}`,
    );
  }

  const voteCompiled = compileQuery(schema, VoteDocument, 'vote', jitOptions);
  if (!isCompiledQuery(voteCompiled)) {
    const originalErrors = voteCompiled?.errors?.map(error => error.originalError || error) || [];
    throw new AggregateError(
      originalErrors,
      `Failed to compile vote: \n\t${originalErrors.join('\n\t')}`,
    );
  }

  return {
    async onCommentAdded(
      variables: OnCommentAddedSubscriptionVariables,
      context?: TOperationContext,
      root?: TOperationRoot,
    ): Promise<AsyncIterableIterator<OnCommentAddedSubscription> | OnCommentAddedSubscription> {
      const result = await onCommentAddedCompiled.subscribe!(
        {
          ...globalRoot,
          ...root,
        },
        {
          ...globalContext,
          ...context,
        },
        variables,
      );
      return handleSubscriptionResult(result, 'onCommentAdded');
    },
    async Comment(
      variables: CommentQueryVariables,
      context?: TOperationContext,
      root?: TOperationRoot,
    ): Promise<CommentQuery> {
      const result = await CommentCompiled.query(
        {
          ...globalRoot,
          ...root,
        },
        {
          ...globalContext,
          ...context,
        },
        variables,
      );
      return handleExecutionResult(result, 'Comment');
    },
    async CurrentUserForProfile(
      variables?: CurrentUserForProfileQueryVariables,
      context?: TOperationContext,
      root?: TOperationRoot,
    ): Promise<CurrentUserForProfileQuery> {
      const result = await CurrentUserForProfileCompiled.query(
        {
          ...globalRoot,
          ...root,
        },
        {
          ...globalContext,
          ...context,
        },
        variables,
      );
      return handleExecutionResult(result, 'CurrentUserForProfile');
    },
    async Feed(
      variables: FeedQueryVariables,
      context?: TOperationContext,
      root?: TOperationRoot,
    ): Promise<FeedQuery> {
      const result = await FeedCompiled.query(
        {
          ...globalRoot,
          ...root,
        },
        {
          ...globalContext,
          ...context,
        },
        variables,
      );
      return handleExecutionResult(result, 'Feed');
    },
    async submitRepository(
      variables: SubmitRepositoryMutationVariables,
      context?: TOperationContext,
      root?: TOperationRoot,
    ): Promise<SubmitRepositoryMutation> {
      const result = await submitRepositoryCompiled.query(
        {
          ...globalRoot,
          ...root,
        },
        {
          ...globalContext,
          ...context,
        },
        variables,
      );
      return handleExecutionResult(result, 'submitRepository');
    },
    async submitComment(
      variables: SubmitCommentMutationVariables,
      context?: TOperationContext,
      root?: TOperationRoot,
    ): Promise<SubmitCommentMutation> {
      const result = await submitCommentCompiled.query(
        {
          ...globalRoot,
          ...root,
        },
        {
          ...globalContext,
          ...context,
        },
        variables,
      );
      return handleExecutionResult(result, 'submitComment');
    },
    async vote(
      variables: VoteMutationVariables,
      context?: TOperationContext,
      root?: TOperationRoot,
    ): Promise<VoteMutation> {
      const result = await voteCompiled.query(
        {
          ...globalRoot,
          ...root,
        },
        {
          ...globalContext,
          ...context,
        },
        variables,
      );
      return handleExecutionResult(result, 'vote');
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;
