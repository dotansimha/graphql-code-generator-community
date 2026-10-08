export const NodeTitleFragment = /* GraphQL */ `
  fragment NodeTitle on Node {
    ... on Article {
      title
    }
    ... on Video {
      title
    }
    ... on Image {
      title
    }
  }
`;
