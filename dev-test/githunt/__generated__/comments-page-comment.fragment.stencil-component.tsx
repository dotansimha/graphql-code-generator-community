import gql from 'graphql-tag';

/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };

declare global {
  export type CommentsPageCommentFragment = {
    id: number;
    createdAt: number;
    content: string;
    postedBy: { login: string; html_url: string };
  };
}

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
