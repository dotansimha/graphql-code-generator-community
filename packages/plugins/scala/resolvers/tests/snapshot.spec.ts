import { buildSchema } from 'graphql';
import { plugin } from '../src';

describe('Scala Resolvers Snapshot', () => {
  it('should match snapshot', async () => {
    const schema = buildSchema(`
      type Query {
        user(id: ID!): User
        posts(limit: Int = 10): [Post!]!
      }

      type Mutation {
        createPost(input: PostInput!): Post!
      }

      type User {
        id: ID!
        name: String!
        email: String!
        posts: [Post!]!
      }

      type Post {
        id: ID!
        title: String!
        content: String!
        author: User!
        comments: [Comment!]!
        createdAt: DateTime!
      }

      type Comment {
        id: ID!
        text: String!
        author: User!
        post: Post!
      }

      interface Node {
        id: ID!
      }

      union SearchResult = User | Post

      input PostInput {
        title: String!
        content: String!
        authorId: ID!
      }

      scalar DateTime
    `);

    const result = await plugin(
      schema,
      [],
      {
        packageName: 'com.example.blog',
        withFuture: true,
      },
      { outputFile: 'src/main/scala/com/example/blog/BlogResolvers.scala' },
    );

    // Snapshot of the entire generated file
    expect(result).toMatchSnapshot();
  });

  it('should match snapshot with ZIO support', async () => {
    const schema = buildSchema(`
      type Query {
        user(id: ID!): User
      }

      type User {
        id: ID!
        name: String!
      }
    `);

    const result = await plugin(
      schema,
      [],
      {
        packageName: 'com.example.zio',
        withZIO: true,
      },
      { outputFile: 'src/main/scala/com/example/zio/ZioResolvers.scala' },
    );

    // Snapshot of the ZIO-based resolvers
    expect(result).toMatchSnapshot();
  });

  it('should match snapshot with custom mappers and options', async () => {
    const schema = buildSchema(`
      type Query {
        user(id: ID!): User
      }

      type User {
        id: ID!
        name: String
        email: String!
      }
    `);

    const result = await plugin(
      schema,
      [],
      {
        packageName: 'com.example.custom',
        useOptions: true,
      },
      { outputFile: 'src/main/scala/com/example/custom/CustomResolvers.scala' },
    );

    // Snapshot with custom mappers and options
    expect(result).toMatchSnapshot();
  });
});
