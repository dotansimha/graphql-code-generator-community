import gql from 'graphql-tag';
import { MARKDOWN_FRAGMENT } from './issue-11026-markdown';

export const WIDGET_FRAGMENT = gql`
  fragment WidgetFragment on Widget {
    title {
      ...MarkdownFragment
    }
  }
  ${MARKDOWN_FRAGMENT}
`;

export const PING_QUERY = gql`
  query Ping {
    ping {
      ...WidgetFragment
    }
  }
  ${WIDGET_FRAGMENT}
`;
