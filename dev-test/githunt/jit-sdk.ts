/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { GraphQLSchema, ExecutionResult } from 'graphql';
import { compileQuery, isCompiledQuery, CompilerOptions } from 'graphql-jit';
import { AggregateError, isAsyncIterable, mapAsyncIterator } from '@graphql-tools/utils';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

/** A comment about an entry, submitted by a user */
export type Comment = {
  __typename?: 'Comment';
  /** The text of the comment */
  content: Scalars['String']['output'];
  /** A timestamp of when the comment was posted */
  createdAt: Scalars['Float']['output'];
  /** The SQL ID of this entry */
  id: Scalars['Int']['output'];
  /** The GitHub user who posted the comment */
  postedBy: User;
  /** The repository which this comment is about */
  repoName: Scalars['String']['output'];
};

/** Information about a GitHub repository submitted to GitHunt */
export type Entry = {
  __typename?: 'Entry';
  /** The number of comments posted about this repository */
  commentCount: Scalars['Int']['output'];
  /** Comments posted about this repository */
  comments: Array<Maybe<Comment>>;
  /** A timestamp of when the entry was submitted */
  createdAt: Scalars['Float']['output'];
  /** The hot score of this repository */
  hotScore: Scalars['Float']['output'];
  /** The SQL ID of this entry */
  id: Scalars['Int']['output'];
  /** The GitHub user who submitted this entry */
  postedBy: User;
  /** Information about the repository from GitHub */
  repository: Repository;
  /** The score of this repository, upvotes - downvotes */
  score: Scalars['Int']['output'];
  /** XXX to be changed */
  vote: Vote;
};

/** Information about a GitHub repository submitted to GitHunt */
export type EntryCommentsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

/** A list of options for the sort order of the feed */
export enum FeedType {
  /** Sort by a combination of freshness and score, using Reddit's algorithm */
  Hot = 'HOT',
  /** Newest entries first */
  New = 'NEW',
  /** Highest score entries first */
  Top = 'TOP',
}

export type Mutation = {
  __typename?: 'Mutation';
  /** Comment on a repository, returns the new comment */
  submitComment?: Maybe<Comment>;
  /** Submit a new repository, returns the new submission */
  submitRepository?: Maybe<Entry>;
  /** Vote on a repository submission, returns the submission that was voted on */
  vote?: Maybe<Entry>;
};

export type MutationSubmitCommentArgs = {
  commentContent: Scalars['String']['input'];
  repoFullName: Scalars['String']['input'];
};

export type MutationSubmitRepositoryArgs = {
  repoFullName: Scalars['String']['input'];
};

export type MutationVoteArgs = {
  repoFullName: Scalars['String']['input'];
  type: VoteType;
};

export type Query = {
  __typename?: 'Query';
  /** Return the currently logged in user, or null if nobody is logged in */
  currentUser?: Maybe<User>;
  /** A single entry */
  entry?: Maybe<Entry>;
  /** A feed of repository submissions */
  feed?: Maybe<Array<Maybe<Entry>>>;
};

export type QueryEntryArgs = {
  repoFullName: Scalars['String']['input'];
};

export type QueryFeedArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  type: FeedType;
};

/**
 * A repository object from the GitHub API. This uses the exact field names returned by the
 * GitHub API for simplicity, even though the convention for GraphQL is usually to camel case.
 */
export type Repository = {
  __typename?: 'Repository';
  /** The description of the repository */
  description?: Maybe<Scalars['String']['output']>;
  /** The full name of the repository with the username, e.g. apollostack/GitHunt-API */
  full_name: Scalars['String']['output'];
  /** The link to the repository on GitHub */
  html_url: Scalars['String']['output'];
  /** Just the name of the repository, e.g. GitHunt-API */
  name: Scalars['String']['output'];
  /** The number of open issues on this repository on GitHub */
  open_issues_count?: Maybe<Scalars['Int']['output']>;
  /** The owner of this repository on GitHub, e.g. apollostack */
  owner?: Maybe<User>;
  /** The number of people who have starred this repository on GitHub */
  stargazers_count: Scalars['Int']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  /** Subscription fires on every comment added */
  commentAdded?: Maybe<Comment>;
};

export type SubscriptionCommentAddedArgs = {
  repoFullName: Scalars['String']['input'];
};

/** A user object from the GitHub API. This uses the exact field names returned from the GitHub API. */
export type User = {
  __typename?: 'User';
  /** The URL to a directly embeddable image for this user's avatar */
  avatar_url: Scalars['String']['output'];
  /** The URL of this user's GitHub page */
  html_url: Scalars['String']['output'];
  /** The name of the user, e.g. apollostack */
  login: Scalars['String']['output'];
};

/** XXX to be removed */
export type Vote = {
  __typename?: 'Vote';
  vote_value: Scalars['Int']['output'];
};

/** The type of vote to record, when submitting a vote */
export enum VoteType {
  Cancel = 'CANCEL',
  Down = 'DOWN',
  Up = 'UP',
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
