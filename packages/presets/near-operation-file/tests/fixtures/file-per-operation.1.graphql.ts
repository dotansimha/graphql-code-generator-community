export const user1a = /* GraphQL */ `
  query User1a {
    user1a: user {
      id
    }
  }
`;
export const user1b = /* GraphQL */ `
  query User1b {
    user1b: user {
      id
      name
    }
  }
`;

export const anon = /* GraphQL */ `
  query {
    anon: user {
      __typename
    }
  }
`;
