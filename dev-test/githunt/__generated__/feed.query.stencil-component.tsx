import gql from 'graphql-tag';
import { FeedEntryFragmentDoc } from './feed-entry.fragment.stencil-component.js';
import { RepoInfoFragmentDoc } from './repo-info.fragment.stencil-component.js';
import { VoteButtonsFragmentDoc } from './vote-buttons.fragment.stencil-component.js';
import 'stencil-apollo';
import { Component, h, Prop } from '@stencil/core';

/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };

declare global {
  /** A list of options for the sort order of the feed */
  export type FeedType =
    /** Sort by a combination of freshness and score, using Reddit's algorithm */
    | 'HOT'
    /** Newest entries first */
    | 'NEW'
    /** Highest score entries first */
    | 'TOP';

  export type FeedQueryVariables = Exact<{
    type: Types.FeedType;
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
}

const FeedDocument = gql`
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

@Component({
  tag: 'apollo-feed',
})
export class FeedComponent {
  @Prop() renderer: import('stencil-apollo').QueryRenderer<FeedQuery, FeedQueryVariables>;
  @Prop() variables: FeedQueryVariables;
  render() {
    return (
      <apollo-query query={FeedDocument} variables={this.variables} renderer={this.renderer} />
    );
  }
}
