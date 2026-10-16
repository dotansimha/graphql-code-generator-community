export const RootAndNestedNodeQuery = /* GraphQL */ `
  query RootAndNestedNode {
    ...NodeFragment
    me {
      ...NodeFragment
    }
  }
`;
