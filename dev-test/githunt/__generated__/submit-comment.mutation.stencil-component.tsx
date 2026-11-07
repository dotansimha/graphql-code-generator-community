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
}

const SubmitCommentDocument = gql`
  mutation submitComment($repoFullName: String!, $commentContent: String!) {
    submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
      ...CommentsPageComment
    }
  }
  ${CommentsPageCommentFragmentDoc}
`;

@Component({
  tag: 'apollo-submit-comment',
})
export class SubmitCommentComponent {
  @Prop() renderer: import('stencil-apollo').MutationRenderer<
    SubmitCommentMutation,
    SubmitCommentMutationVariables
  >;
  @Prop() variables: SubmitCommentMutationVariables;
  render() {
    return (
      <apollo-mutation
        mutation={SubmitCommentDocument}
        variables={this.variables}
        renderer={this.renderer}
      />
    );
  }
}
