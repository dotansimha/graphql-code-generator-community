import gql from 'graphql-tag';
import { CommentsPageCommentFragmentDoc } from './comments-page-comment.fragment.stencil-component.js';
import 'stencil-apollo';
import { Component, h, Prop } from '@stencil/core';

/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };

declare global {
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
}

const CommentDocument = gql`
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

@Component({
  tag: 'apollo-comment',
})
export class CommentComponent {
  @Prop() renderer: import('stencil-apollo').QueryRenderer<CommentQuery, CommentQueryVariables>;
  @Prop() variables: CommentQueryVariables;
  render() {
    return (
      <apollo-query query={CommentDocument} variables={this.variables} renderer={this.renderer} />
    );
  }
}
