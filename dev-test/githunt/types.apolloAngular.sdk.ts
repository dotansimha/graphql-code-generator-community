import { gql } from 'apollo-angular';
import * as Apollo from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as ApolloCore from '@apollo/client/core';

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

@Injectable({
  providedIn: 'root',
})
export class OnCommentAddedGQL extends Apollo.Subscription<
  OnCommentAddedSubscription,
  OnCommentAddedSubscriptionVariables
> {
  document = OnCommentAddedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
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

@Injectable({
  providedIn: 'root',
})
export class CommentGQL extends Apollo.Query<CommentQuery, CommentQueryVariables> {
  document = CommentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CurrentUserForProfileDocument = gql`
  query CurrentUserForProfile {
    currentUser {
      login
      avatar_url
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class CurrentUserForProfileGQL extends Apollo.Query<
  CurrentUserForProfileQuery,
  CurrentUserForProfileQueryVariables
> {
  document = CurrentUserForProfileDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
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

@Injectable({
  providedIn: 'root',
})
export class FeedGQL extends Apollo.Query<FeedQuery, FeedQueryVariables> {
  document = FeedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const SubmitRepositoryDocument = gql`
  mutation submitRepository($repoFullName: String!) {
    submitRepository(repoFullName: $repoFullName) {
      createdAt
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class SubmitRepositoryGQL extends Apollo.Mutation<
  SubmitRepositoryMutation,
  SubmitRepositoryMutationVariables
> {
  document = SubmitRepositoryDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const SubmitCommentDocument = gql`
  mutation submitComment($repoFullName: String!, $commentContent: String!) {
    submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
      ...CommentsPageComment
    }
  }
  ${CommentsPageCommentFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class SubmitCommentGQL extends Apollo.Mutation<
  SubmitCommentMutation,
  SubmitCommentMutationVariables
> {
  document = SubmitCommentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
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

@Injectable({
  providedIn: 'root',
})
export class VoteGQL extends Apollo.Mutation<VoteMutation, VoteMutationVariables> {
  document = VoteDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

interface WatchQueryOptionsAlone<V> extends Omit<
  ApolloCore.WatchQueryOptions<V>,
  'query' | 'variables'
> {}

interface QueryOptionsAlone<V> extends Omit<ApolloCore.QueryOptions<V>, 'query' | 'variables'> {}

interface MutationOptionsAlone<T, V> extends Omit<
  ApolloCore.MutationOptions<T, V>,
  'mutation' | 'variables'
> {}

interface SubscriptionOptionsAlone<V> extends Omit<
  ApolloCore.SubscriptionOptions<V>,
  'query' | 'variables'
> {}

@Injectable({ providedIn: 'root' })
export class ApolloAngularSDK {
  constructor(
    private onCommentAddedGql: OnCommentAddedGQL,
    private commentGql: CommentGQL,
    private currentUserForProfileGql: CurrentUserForProfileGQL,
    private feedGql: FeedGQL,
    private submitRepositoryGql: SubmitRepositoryGQL,
    private submitCommentGql: SubmitCommentGQL,
    private voteGql: VoteGQL,
  ) {}

  onCommentAdded(
    variables: OnCommentAddedSubscriptionVariables,
    options?: SubscriptionOptionsAlone<OnCommentAddedSubscriptionVariables>,
  ) {
    return this.onCommentAddedGql.subscribe(variables, options);
  }

  comment(variables: CommentQueryVariables, options?: QueryOptionsAlone<CommentQueryVariables>) {
    return this.commentGql.fetch(variables, options);
  }

  commentWatch(
    variables: CommentQueryVariables,
    options?: WatchQueryOptionsAlone<CommentQueryVariables>,
  ) {
    return this.commentGql.watch(variables, options);
  }

  currentUserForProfile(
    variables?: CurrentUserForProfileQueryVariables,
    options?: QueryOptionsAlone<CurrentUserForProfileQueryVariables>,
  ) {
    return this.currentUserForProfileGql.fetch(variables, options);
  }

  currentUserForProfileWatch(
    variables?: CurrentUserForProfileQueryVariables,
    options?: WatchQueryOptionsAlone<CurrentUserForProfileQueryVariables>,
  ) {
    return this.currentUserForProfileGql.watch(variables, options);
  }

  feed(variables: FeedQueryVariables, options?: QueryOptionsAlone<FeedQueryVariables>) {
    return this.feedGql.fetch(variables, options);
  }

  feedWatch(variables: FeedQueryVariables, options?: WatchQueryOptionsAlone<FeedQueryVariables>) {
    return this.feedGql.watch(variables, options);
  }

  submitRepository(
    variables: SubmitRepositoryMutationVariables,
    options?: MutationOptionsAlone<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>,
  ) {
    return this.submitRepositoryGql.mutate(variables, options);
  }

  submitComment(
    variables: SubmitCommentMutationVariables,
    options?: MutationOptionsAlone<SubmitCommentMutation, SubmitCommentMutationVariables>,
  ) {
    return this.submitCommentGql.mutate(variables, options);
  }

  vote(
    variables: VoteMutationVariables,
    options?: MutationOptionsAlone<VoteMutation, VoteMutationVariables>,
  ) {
    return this.voteGql.mutate(variables, options);
  }
}
