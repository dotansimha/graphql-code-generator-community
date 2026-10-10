export const WIDGET_FRAGMENT = /* GraphQL */ `
  fragment WidgetFragment on Widget {
    title {
      ...MarkdownFragment
    }
  }
`;

export const PING_QUERY = /* GraphQL */ `
  query Ping {
    ping {
      ...WidgetFragment
    }
  }
`;
