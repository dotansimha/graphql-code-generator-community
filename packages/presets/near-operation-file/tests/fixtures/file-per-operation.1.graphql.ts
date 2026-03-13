/* GraphQL */ `
  query User1a {
    user1a: user {
      id
    }
  }
`;
/* GraphQL */ `
  query User1b {
    user1b: user {
      id
      name
    }
  }
`;

/* GraphQL */ `
  query {
    anon: user {
      __typename
    }
  }
`;
