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
  /** The type of vote to record, when submitting a vote */
  export type VoteType = 'CANCEL' | 'DOWN' | 'UP';

  export type VoteMutationVariables = Exact<{
    repoFullName: string;
    type: Types.VoteType;
  }>;

  export type VoteMutation = {
    vote: { score: number; id: number; vote: { vote_value: number } } | null;
  };
}

const VoteDocument = gql`
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

@Component({
  tag: 'apollo-vote',
})
export class VoteComponent {
  @Prop() renderer: import('stencil-apollo').MutationRenderer<VoteMutation, VoteMutationVariables>;
  @Prop() variables: VoteMutationVariables;
  render() {
    return (
      <apollo-mutation
        mutation={VoteDocument}
        variables={this.variables}
        renderer={this.renderer}
      />
    );
  }
}
