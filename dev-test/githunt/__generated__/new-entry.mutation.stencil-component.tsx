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
  export type SubmitRepositoryMutationVariables = Exact<{
    repoFullName: string;
  }>;

  export type SubmitRepositoryMutation = { submitRepository: { createdAt: number } | null };
}

const SubmitRepositoryDocument = gql`
  mutation submitRepository($repoFullName: String!) {
    submitRepository(repoFullName: $repoFullName) {
      createdAt
    }
  }
`;

@Component({
  tag: 'apollo-submit-repository',
})
export class SubmitRepositoryComponent {
  @Prop() renderer: import('stencil-apollo').MutationRenderer<
    SubmitRepositoryMutation,
    SubmitRepositoryMutationVariables
  >;
  @Prop() variables: SubmitRepositoryMutationVariables;
  render() {
    return (
      <apollo-mutation
        mutation={SubmitRepositoryDocument}
        variables={this.variables}
        renderer={this.renderer}
      />
    );
  }
}
