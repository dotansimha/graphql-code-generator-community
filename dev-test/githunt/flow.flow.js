// @flow

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {|
  ID: { input: string, output: string, }
  String: { input: string, output: string, }
  Boolean: { input: boolean, output: boolean, }
  Int: { input: number, output: number, }
  Float: { input: number, output: number, }
|};

/** A comment about an entry, submitted by a user */
export type Comment = {|
  __typename?: 'Comment',
  /** The text of the comment */
  content: $ElementType<$ElementType<Scalars, 'String'>, 'output'>,
  /** A timestamp of when the comment was posted */
  createdAt: $ElementType<$ElementType<Scalars, 'Float'>, 'output'>,
  /** The SQL ID of this entry */
  id: $ElementType<$ElementType<Scalars, 'Int'>, 'output'>,
  /** The GitHub user who posted the comment */
  postedBy: User,
  /** The repository which this comment is about */
  repoName: $ElementType<$ElementType<Scalars, 'String'>, 'output'>,
|};

/** Information about a GitHub repository submitted to GitHunt */
export type Entry = {|
  __typename?: 'Entry',
  /** The number of comments posted about this repository */
  commentCount: $ElementType<$ElementType<Scalars, 'Int'>, 'output'>,
  /** Comments posted about this repository */
  comments: Array<?Comment>,
  /** A timestamp of when the entry was submitted */
  createdAt: $ElementType<$ElementType<Scalars, 'Float'>, 'output'>,
  /** The hot score of this repository */
  hotScore: $ElementType<$ElementType<Scalars, 'Float'>, 'output'>,
  /** The SQL ID of this entry */
  id: $ElementType<$ElementType<Scalars, 'Int'>, 'output'>,
  /** The GitHub user who submitted this entry */
  postedBy: User,
  /** Information about the repository from GitHub */
  repository: Repository,
  /** The score of this repository, upvotes - downvotes */
  score: $ElementType<$ElementType<Scalars, 'Int'>, 'output'>,
  /** XXX to be changed */
  vote: Vote,
|};


/** Information about a GitHub repository submitted to GitHunt */
export type EntryCommentsArgs = {|
  limit?: ?$ElementType<$ElementType<Scalars, 'Int'>, 'input'>,
  offset?: ?$ElementType<$ElementType<Scalars, 'Int'>, 'input'>,
|};

export const FeedTypeValues = Object.freeze({
  /** Sort by a combination of freshness and score, using Reddit's algorithm */
  Hot: 'HOT',
  /** Newest entries first */
  New: 'NEW',
  /** Highest score entries first */
  Top: 'TOP'
});


/** A list of options for the sort order of the feed */
export type FeedType = $Values<typeof FeedTypeValues>;

export type Mutation = {|
  __typename?: 'Mutation',
  /** Comment on a repository, returns the new comment */
  submitComment?: ?Comment,
  /** Submit a new repository, returns the new submission */
  submitRepository?: ?Entry,
  /** Vote on a repository submission, returns the submission that was voted on */
  vote?: ?Entry,
|};


export type MutationSubmitCommentArgs = {|
  commentContent: $ElementType<$ElementType<Scalars, 'String'>, 'input'>,
  repoFullName: $ElementType<$ElementType<Scalars, 'String'>, 'input'>,
|};


export type MutationSubmitRepositoryArgs = {|
  repoFullName: $ElementType<$ElementType<Scalars, 'String'>, 'input'>,
|};


export type MutationVoteArgs = {|
  repoFullName: $ElementType<$ElementType<Scalars, 'String'>, 'input'>,
  type: VoteType,
|};

export type Query = {|
  __typename?: 'Query',
  /** Return the currently logged in user, or null if nobody is logged in */
  currentUser?: ?User,
  /** A single entry */
  entry?: ?Entry,
  /** A feed of repository submissions */
  feed?: ?Array<?Entry>,
|};


export type QueryEntryArgs = {|
  repoFullName: $ElementType<$ElementType<Scalars, 'String'>, 'input'>,
|};


export type QueryFeedArgs = {|
  limit?: ?$ElementType<$ElementType<Scalars, 'Int'>, 'input'>,
  offset?: ?$ElementType<$ElementType<Scalars, 'Int'>, 'input'>,
  type: FeedType,
|};

/**
 * A repository object from the GitHub API. This uses the exact field names returned by the
 * GitHub API for simplicity, even though the convention for GraphQL is usually to camel case.
 */
export type Repository = {|
  __typename?: 'Repository',
  /** The description of the repository */
  description?: ?$ElementType<$ElementType<Scalars, 'String'>, 'output'>,
  /** The full name of the repository with the username, e.g. apollostack/GitHunt-API */
  full_name: $ElementType<$ElementType<Scalars, 'String'>, 'output'>,
  /** The link to the repository on GitHub */
  html_url: $ElementType<$ElementType<Scalars, 'String'>, 'output'>,
  /** Just the name of the repository, e.g. GitHunt-API */
  name: $ElementType<$ElementType<Scalars, 'String'>, 'output'>,
  /** The number of open issues on this repository on GitHub */
  open_issues_count?: ?$ElementType<$ElementType<Scalars, 'Int'>, 'output'>,
  /** The owner of this repository on GitHub, e.g. apollostack */
  owner?: ?User,
  /** The number of people who have starred this repository on GitHub */
  stargazers_count: $ElementType<$ElementType<Scalars, 'Int'>, 'output'>,
|};

export type Subscription = {|
  __typename?: 'Subscription',
  /** Subscription fires on every comment added */
  commentAdded?: ?Comment,
|};


export type SubscriptionCommentAddedArgs = {|
  repoFullName: $ElementType<$ElementType<Scalars, 'String'>, 'input'>,
|};

/** A user object from the GitHub API. This uses the exact field names returned from the GitHub API. */
export type User = {|
  __typename?: 'User',
  /** The URL to a directly embeddable image for this user's avatar */
  avatar_url: $ElementType<$ElementType<Scalars, 'String'>, 'output'>,
  /** The URL of this user's GitHub page */
  html_url: $ElementType<$ElementType<Scalars, 'String'>, 'output'>,
  /** The name of the user, e.g. apollostack */
  login: $ElementType<$ElementType<Scalars, 'String'>, 'output'>,
|};

/** XXX to be removed */
export type Vote = {|
  __typename?: 'Vote',
  vote_value: $ElementType<$ElementType<Scalars, 'Int'>, 'output'>,
|};

export const VoteTypeValues = Object.freeze({
  Cancel: 'CANCEL',
  Down: 'DOWN',
  Up: 'UP'
});


/** The type of vote to record, when submitting a vote */
export type VoteType = $Values<typeof VoteTypeValues>;

type $Pick<Origin: Object, Keys: Object> = $ObjMapi<Keys, <Key>(k: Key) => $ElementType<Origin, Key>>;

export type OnCommentAddedSubscriptionVariables = {
  repoFullName: $ElementType<$ElementType<Scalars, 'String'>, 'input'>,
};


export type OnCommentAddedSubscription = {| commentAdded: ?({|
      ...$Pick<Comment, {| id: *, createdAt: *, content: * |}>,
    ...{| postedBy: $Pick<User, {| login: *, html_url: * |}> |}
  |}) |};

export type CommentQueryVariables = {
  repoFullName: $ElementType<$ElementType<Scalars, 'String'>, 'input'>,
  limit?: ?$ElementType<$ElementType<Scalars, 'Int'>, 'input'>,
  offset?: ?$ElementType<$ElementType<Scalars, 'Int'>, 'input'>,
};


export type CommentQuery = {| currentUser: ?$Pick<User, {| login: *, html_url: * |}>, entry: ?({|
      ...$Pick<Entry, {| id: *, createdAt: *, commentCount: * |}>,
    ...{| postedBy: $Pick<User, {| login: *, html_url: * |}>, comments: Array<?({|
        ...$Pick<Comment, {| id: *, createdAt: *, content: * |}>,
      ...{| postedBy: $Pick<User, {| login: *, html_url: * |}> |}
    |})>, repository: $Pick<Repository, {| description?: *, open_issues_count?: *, stargazers_count: *, full_name: *, html_url: * |}> |}
  |}) |};

export type CommentsPageCommentFragment = ({|
    ...$Pick<Comment, {| id: *, createdAt: *, content: * |}>,
  ...{| postedBy: $Pick<User, {| login: *, html_url: * |}> |}
|});

export type CurrentUserForProfileQueryVariables = {};


export type CurrentUserForProfileQuery = {| currentUser: ?$Pick<User, {| login: *, avatar_url: * |}> |};

export type FeedEntryFragment = ({|
    ...$Pick<Entry, {| id: *, commentCount: *, score: *, createdAt: * |}>,
  ...{| repository: ({|
      ...$Pick<Repository, {| full_name: *, html_url: *, description?: *, stargazers_count: *, open_issues_count?: * |}>,
    ...{| owner: ?$Pick<User, {| avatar_url: * |}> |}
  |}), vote: $Pick<Vote, {| vote_value: * |}>, postedBy: $Pick<User, {| html_url: *, login: * |}> |}
|});

export type FeedQueryVariables = {
  type: FeedType,
  offset?: ?$ElementType<$ElementType<Scalars, 'Int'>, 'input'>,
  limit?: ?$ElementType<$ElementType<Scalars, 'Int'>, 'input'>,
};


export type FeedQuery = {| currentUser: ?$Pick<User, {| login: * |}>, feed: ?Array<?({|
      ...$Pick<Entry, {| id: *, commentCount: *, score: *, createdAt: * |}>,
    ...{| repository: ({|
        ...$Pick<Repository, {| full_name: *, html_url: *, description?: *, stargazers_count: *, open_issues_count?: * |}>,
      ...{| owner: ?$Pick<User, {| avatar_url: * |}> |}
    |}), vote: $Pick<Vote, {| vote_value: * |}>, postedBy: $Pick<User, {| html_url: *, login: * |}> |}
  |})> |};

export type SubmitRepositoryMutationVariables = {
  repoFullName: $ElementType<$ElementType<Scalars, 'String'>, 'input'>,
};


export type SubmitRepositoryMutation = {| submitRepository: ?$Pick<Entry, {| createdAt: * |}> |};

export type RepoInfoFragment = ({|
    ...$Pick<Entry, {| createdAt: * |}>,
  ...{| repository: $Pick<Repository, {| description?: *, stargazers_count: *, open_issues_count?: * |}>, postedBy: $Pick<User, {| html_url: *, login: * |}> |}
|});

export type SubmitCommentMutationVariables = {
  repoFullName: $ElementType<$ElementType<Scalars, 'String'>, 'input'>,
  commentContent: $ElementType<$ElementType<Scalars, 'String'>, 'input'>,
};


export type SubmitCommentMutation = {| submitComment: ?({|
      ...$Pick<Comment, {| id: *, createdAt: *, content: * |}>,
    ...{| postedBy: $Pick<User, {| login: *, html_url: * |}> |}
  |}) |};

export type VoteButtonsFragment = ({|
    ...$Pick<Entry, {| score: * |}>,
  ...{| vote: $Pick<Vote, {| vote_value: * |}> |}
|});

export type VoteMutationVariables = {
  repoFullName: $ElementType<$ElementType<Scalars, 'String'>, 'input'>,
  type: VoteType,
};


export type VoteMutation = {| vote: ?({|
      ...$Pick<Entry, {| score: *, id: * |}>,
    ...{| vote: $Pick<Vote, {| vote_value: * |}> |}
  |}) |};
