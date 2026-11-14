import gql from 'graphql-tag';

/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };

declare global {
  export type RepoInfoFragment = {
    createdAt: number;
    repository: {
      description: string | null;
      stargazers_count: number;
      open_issues_count: number | null;
    };
    postedBy: { html_url: string; login: string };
  };
}

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
