import gql from 'graphql-tag';
import * as StencilApollo from 'stencil-apollo';
import { h } from '@stencil/core';

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

export type OnCommentAddedProps = {
  variables?: OnCommentAddedSubscriptionVariables;
  inlist?: StencilApollo.SubscriptionRenderer<
    OnCommentAddedSubscription,
    OnCommentAddedSubscriptionVariables
  >;
};

export const OnCommentAddedComponent = (
  props: OnCommentAddedProps,
  children: [
    StencilApollo.SubscriptionRenderer<
      OnCommentAddedSubscription,
      OnCommentAddedSubscriptionVariables
    >,
  ],
) => (
  <apollo-subscription subscription={OnCommentAddedDocument} {...props} renderer={children[0]} />
);

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

export type CommentProps = {
  variables?: CommentQueryVariables;
  inlist?: StencilApollo.QueryRenderer<CommentQuery, CommentQueryVariables>;
};

export const CommentComponent = (
  props: CommentProps,
  children: [StencilApollo.QueryRenderer<CommentQuery, CommentQueryVariables>],
) => <apollo-query query={CommentDocument} {...props} renderer={children[0]} />;

export const CurrentUserForProfileDocument = gql`
  query CurrentUserForProfile {
    currentUser {
      login
      avatar_url
    }
  }
`;

export type CurrentUserForProfileProps = {
  variables?: CurrentUserForProfileQueryVariables;
  inlist?: StencilApollo.QueryRenderer<
    CurrentUserForProfileQuery,
    CurrentUserForProfileQueryVariables
  >;
};

export const CurrentUserForProfileComponent = (
  props: CurrentUserForProfileProps,
  children: [
    StencilApollo.QueryRenderer<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>,
  ],
) => <apollo-query query={CurrentUserForProfileDocument} {...props} renderer={children[0]} />;

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

export type FeedProps = {
  variables?: FeedQueryVariables;
  inlist?: StencilApollo.QueryRenderer<FeedQuery, FeedQueryVariables>;
};

export const FeedComponent = (
  props: FeedProps,
  children: [StencilApollo.QueryRenderer<FeedQuery, FeedQueryVariables>],
) => <apollo-query query={FeedDocument} {...props} renderer={children[0]} />;

export const SubmitRepositoryDocument = gql`
  mutation submitRepository($repoFullName: String!) {
    submitRepository(repoFullName: $repoFullName) {
      createdAt
    }
  }
`;

export type SubmitRepositoryProps = {
  variables?: SubmitRepositoryMutationVariables;
  inlist?: StencilApollo.MutationRenderer<
    SubmitRepositoryMutation,
    SubmitRepositoryMutationVariables
  >;
};

export const SubmitRepositoryComponent = (
  props: SubmitRepositoryProps,
  children: [
    StencilApollo.MutationRenderer<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>,
  ],
) => <apollo-mutation mutation={SubmitRepositoryDocument} {...props} renderer={children[0]} />;

export const SubmitCommentDocument = gql`
  mutation submitComment($repoFullName: String!, $commentContent: String!) {
    submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
      ...CommentsPageComment
    }
  }
  ${CommentsPageCommentFragmentDoc}
`;

export type SubmitCommentProps = {
  variables?: SubmitCommentMutationVariables;
  inlist?: StencilApollo.MutationRenderer<SubmitCommentMutation, SubmitCommentMutationVariables>;
};

export const SubmitCommentComponent = (
  props: SubmitCommentProps,
  children: [StencilApollo.MutationRenderer<SubmitCommentMutation, SubmitCommentMutationVariables>],
) => <apollo-mutation mutation={SubmitCommentDocument} {...props} renderer={children[0]} />;

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

export type VoteProps = {
  variables?: VoteMutationVariables;
  inlist?: StencilApollo.MutationRenderer<VoteMutation, VoteMutationVariables>;
};

export const VoteComponent = (
  props: VoteProps,
  children: [StencilApollo.MutationRenderer<VoteMutation, VoteMutationVariables>],
) => <apollo-mutation mutation={VoteDocument} {...props} renderer={children[0]} />;
