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
  export type CurrentUserForProfileQueryVariables = Exact<{ [key: string]: never }>;

  export type CurrentUserForProfileQuery = {
    currentUser: { login: string; avatar_url: string } | null;
  };
}

const CurrentUserForProfileDocument = gql`
  query CurrentUserForProfile {
    currentUser {
      login
      avatar_url
    }
  }
`;

@Component({
  tag: 'apollo-current-user-for-profile',
})
export class CurrentUserForProfileComponent {
  @Prop() renderer: import('stencil-apollo').QueryRenderer<
    CurrentUserForProfileQuery,
    CurrentUserForProfileQueryVariables
  >;
  @Prop() variables: CurrentUserForProfileQueryVariables;
  render() {
    return (
      <apollo-query
        query={CurrentUserForProfileDocument}
        variables={this.variables}
        renderer={this.renderer}
      />
    );
  }
}
