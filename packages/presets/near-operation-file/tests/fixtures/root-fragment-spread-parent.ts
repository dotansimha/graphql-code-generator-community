export const NodeCardFragment = /* GraphQL */ `
  fragment NodeCard on Node {
    id
    ...NodeTitle
    ... on Video {
      thumbnail {
        ...NodeTitle
      }
    }
  }
`;
