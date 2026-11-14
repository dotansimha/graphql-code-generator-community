import gql from 'graphql-tag';
import 'stencil-apollo';
import { Component, h, Prop } from '@stencil/core';

/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };

declare global {
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
}

const OnCommentAddedDocument = gql`
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

@Component({
  tag: 'apollo-on-comment-added',
})
export class OnCommentAddedComponent {
  @Prop() renderer: import('stencil-apollo').SubscriptionRenderer<
    OnCommentAddedSubscription,
    OnCommentAddedSubscriptionVariables
  >;
  @Prop() variables: OnCommentAddedSubscriptionVariables;
  render() {
    return (
      <apollo-subscription
        subscription={OnCommentAddedDocument}
        variables={this.variables}
        renderer={this.renderer}
      />
    );
  }
}
