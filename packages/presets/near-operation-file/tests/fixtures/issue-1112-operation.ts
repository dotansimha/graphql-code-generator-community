export const CatsQuery = /* GraphQL */ `
  query Cats {
    cats {
      ...AnimalFragment
    }
  }
`;
