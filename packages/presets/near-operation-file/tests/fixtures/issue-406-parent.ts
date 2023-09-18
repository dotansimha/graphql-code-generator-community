export const User1Fragment = /* GraphQL */ `
    fragment User1 on User {
        id
        ...UserEmail
        ...UserName
    }
`;

export const User2Fragment = /* GraphQL */ `
    fragment User2 on User {
        id
        ...UserName
    }
`;