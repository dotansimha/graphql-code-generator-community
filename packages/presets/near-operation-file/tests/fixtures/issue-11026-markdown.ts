import gql from 'graphql-tag';

export const MARKDOWN_FRAGMENT = gql`
  fragment MarkdownFragment on Markdown {
    markdown
  }
`;
