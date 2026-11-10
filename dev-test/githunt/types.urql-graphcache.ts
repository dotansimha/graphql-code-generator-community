import {
  cacheExchange,
  OptimisticMutationResolver as GraphCacheOptimisticMutationResolver,
  Resolver as GraphCacheResolver,
  UpdateResolver as GraphCacheUpdateResolver,
} from '@urql/exchange-graphcache';

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

export type WithTypename<T extends { __typename?: any }> = Partial<T> & {
  __typename: NonNullable<T['__typename']>;
};

export type GraphCacheKeysConfig = {
  Comment?: (data: WithTypename<Comment>) => null | string;
  Entry?: (data: WithTypename<Entry>) => null | string;
  Repository?: (data: WithTypename<Repository>) => null | string;
  User?: (data: WithTypename<User>) => null | string;
  Vote?: (data: WithTypename<Vote>) => null | string;
};

export type GraphCacheResolvers = {
  Query?: {
    currentUser?: GraphCacheResolver<
      WithTypename<Query>,
      Record<string, never>,
      WithTypename<User> | string
    >;
    entry?: GraphCacheResolver<WithTypename<Query>, QueryEntryArgs, WithTypename<Entry> | string>;
    feed?: GraphCacheResolver<
      WithTypename<Query>,
      QueryFeedArgs,
      Array<WithTypename<Entry> | string>
    >;
  };
  Comment?: {
    content?: GraphCacheResolver<
      WithTypename<Comment>,
      Record<string, never>,
      Scalars['String']['output'] | string
    >;
    createdAt?: GraphCacheResolver<
      WithTypename<Comment>,
      Record<string, never>,
      Scalars['Float']['output'] | string
    >;
    id?: GraphCacheResolver<
      WithTypename<Comment>,
      Record<string, never>,
      Scalars['Int']['output'] | string
    >;
    postedBy?: GraphCacheResolver<
      WithTypename<Comment>,
      Record<string, never>,
      WithTypename<User> | string
    >;
    repoName?: GraphCacheResolver<
      WithTypename<Comment>,
      Record<string, never>,
      Scalars['String']['output'] | string
    >;
  };
  Entry?: {
    commentCount?: GraphCacheResolver<
      WithTypename<Entry>,
      Record<string, never>,
      Scalars['Int']['output'] | string
    >;
    comments?: GraphCacheResolver<
      WithTypename<Entry>,
      EntryCommentsArgs,
      Array<WithTypename<Comment> | string>
    >;
    createdAt?: GraphCacheResolver<
      WithTypename<Entry>,
      Record<string, never>,
      Scalars['Float']['output'] | string
    >;
    hotScore?: GraphCacheResolver<
      WithTypename<Entry>,
      Record<string, never>,
      Scalars['Float']['output'] | string
    >;
    id?: GraphCacheResolver<
      WithTypename<Entry>,
      Record<string, never>,
      Scalars['Int']['output'] | string
    >;
    postedBy?: GraphCacheResolver<
      WithTypename<Entry>,
      Record<string, never>,
      WithTypename<User> | string
    >;
    repository?: GraphCacheResolver<
      WithTypename<Entry>,
      Record<string, never>,
      WithTypename<Repository> | string
    >;
    score?: GraphCacheResolver<
      WithTypename<Entry>,
      Record<string, never>,
      Scalars['Int']['output'] | string
    >;
    vote?: GraphCacheResolver<
      WithTypename<Entry>,
      Record<string, never>,
      WithTypename<Vote> | string
    >;
  };
  Repository?: {
    description?: GraphCacheResolver<
      WithTypename<Repository>,
      Record<string, never>,
      Scalars['String']['output'] | string
    >;
    full_name?: GraphCacheResolver<
      WithTypename<Repository>,
      Record<string, never>,
      Scalars['String']['output'] | string
    >;
    html_url?: GraphCacheResolver<
      WithTypename<Repository>,
      Record<string, never>,
      Scalars['String']['output'] | string
    >;
    name?: GraphCacheResolver<
      WithTypename<Repository>,
      Record<string, never>,
      Scalars['String']['output'] | string
    >;
    open_issues_count?: GraphCacheResolver<
      WithTypename<Repository>,
      Record<string, never>,
      Scalars['Int']['output'] | string
    >;
    owner?: GraphCacheResolver<
      WithTypename<Repository>,
      Record<string, never>,
      WithTypename<User> | string
    >;
    stargazers_count?: GraphCacheResolver<
      WithTypename<Repository>,
      Record<string, never>,
      Scalars['Int']['output'] | string
    >;
  };
  User?: {
    avatar_url?: GraphCacheResolver<
      WithTypename<User>,
      Record<string, never>,
      Scalars['String']['output'] | string
    >;
    html_url?: GraphCacheResolver<
      WithTypename<User>,
      Record<string, never>,
      Scalars['String']['output'] | string
    >;
    login?: GraphCacheResolver<
      WithTypename<User>,
      Record<string, never>,
      Scalars['String']['output'] | string
    >;
  };
  Vote?: {
    vote_value?: GraphCacheResolver<
      WithTypename<Vote>,
      Record<string, never>,
      Scalars['Int']['output'] | string
    >;
  };
};

export type GraphCacheOptimisticUpdaters = {
  submitComment?: GraphCacheOptimisticMutationResolver<
    MutationSubmitCommentArgs,
    Maybe<WithTypename<Comment>>
  >;
  submitRepository?: GraphCacheOptimisticMutationResolver<
    MutationSubmitRepositoryArgs,
    Maybe<WithTypename<Entry>>
  >;
  vote?: GraphCacheOptimisticMutationResolver<MutationVoteArgs, Maybe<WithTypename<Entry>>>;
};

export type GraphCacheUpdaters = {
  Query?: {
    currentUser?: GraphCacheUpdateResolver<
      { currentUser: Maybe<WithTypename<User>> },
      Record<string, never>
    >;
    entry?: GraphCacheUpdateResolver<{ entry: Maybe<WithTypename<Entry>> }, QueryEntryArgs>;
    feed?: GraphCacheUpdateResolver<{ feed: Maybe<Array<WithTypename<Entry>>> }, QueryFeedArgs>;
  };
  Mutation?: {
    submitComment?: GraphCacheUpdateResolver<
      { submitComment: Maybe<WithTypename<Comment>> },
      MutationSubmitCommentArgs
    >;
    submitRepository?: GraphCacheUpdateResolver<
      { submitRepository: Maybe<WithTypename<Entry>> },
      MutationSubmitRepositoryArgs
    >;
    vote?: GraphCacheUpdateResolver<{ vote: Maybe<WithTypename<Entry>> }, MutationVoteArgs>;
  };
  Subscription?: {
    commentAdded?: GraphCacheUpdateResolver<
      { commentAdded: Maybe<WithTypename<Comment>> },
      SubscriptionCommentAddedArgs
    >;
  };
  Comment?: {
    content?: GraphCacheUpdateResolver<Maybe<WithTypename<Comment>>, Record<string, never>>;
    createdAt?: GraphCacheUpdateResolver<Maybe<WithTypename<Comment>>, Record<string, never>>;
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<Comment>>, Record<string, never>>;
    postedBy?: GraphCacheUpdateResolver<Maybe<WithTypename<Comment>>, Record<string, never>>;
    repoName?: GraphCacheUpdateResolver<Maybe<WithTypename<Comment>>, Record<string, never>>;
  };
  Entry?: {
    commentCount?: GraphCacheUpdateResolver<Maybe<WithTypename<Entry>>, Record<string, never>>;
    comments?: GraphCacheUpdateResolver<Maybe<WithTypename<Entry>>, EntryCommentsArgs>;
    createdAt?: GraphCacheUpdateResolver<Maybe<WithTypename<Entry>>, Record<string, never>>;
    hotScore?: GraphCacheUpdateResolver<Maybe<WithTypename<Entry>>, Record<string, never>>;
    id?: GraphCacheUpdateResolver<Maybe<WithTypename<Entry>>, Record<string, never>>;
    postedBy?: GraphCacheUpdateResolver<Maybe<WithTypename<Entry>>, Record<string, never>>;
    repository?: GraphCacheUpdateResolver<Maybe<WithTypename<Entry>>, Record<string, never>>;
    score?: GraphCacheUpdateResolver<Maybe<WithTypename<Entry>>, Record<string, never>>;
    vote?: GraphCacheUpdateResolver<Maybe<WithTypename<Entry>>, Record<string, never>>;
  };
  Repository?: {
    description?: GraphCacheUpdateResolver<Maybe<WithTypename<Repository>>, Record<string, never>>;
    full_name?: GraphCacheUpdateResolver<Maybe<WithTypename<Repository>>, Record<string, never>>;
    html_url?: GraphCacheUpdateResolver<Maybe<WithTypename<Repository>>, Record<string, never>>;
    name?: GraphCacheUpdateResolver<Maybe<WithTypename<Repository>>, Record<string, never>>;
    open_issues_count?: GraphCacheUpdateResolver<
      Maybe<WithTypename<Repository>>,
      Record<string, never>
    >;
    owner?: GraphCacheUpdateResolver<Maybe<WithTypename<Repository>>, Record<string, never>>;
    stargazers_count?: GraphCacheUpdateResolver<
      Maybe<WithTypename<Repository>>,
      Record<string, never>
    >;
  };
  User?: {
    avatar_url?: GraphCacheUpdateResolver<Maybe<WithTypename<User>>, Record<string, never>>;
    html_url?: GraphCacheUpdateResolver<Maybe<WithTypename<User>>, Record<string, never>>;
    login?: GraphCacheUpdateResolver<Maybe<WithTypename<User>>, Record<string, never>>;
  };
  Vote?: {
    vote_value?: GraphCacheUpdateResolver<Maybe<WithTypename<Vote>>, Record<string, never>>;
  };
};

export type GraphCacheConfig = Parameters<typeof cacheExchange>[0] & {
  updates?: GraphCacheUpdaters;
  keys?: GraphCacheKeysConfig;
  optimistic?: GraphCacheOptimisticUpdaters;
  resolvers?: GraphCacheResolvers;
};
