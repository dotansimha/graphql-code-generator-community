import { buildSchema } from 'graphql';
import { plugin } from '../src';

describe('Scala Resolvers Examples', () => {
  it('should generate a complete example with custom types and Future', async () => {
    const schema = buildSchema(`
      type Query {
        getUser(id: ID!): User
        listUsers(limit: Int, offset: Int): [User!]!
        searchUsers(query: String!): [User!]!
        findByRole(role: UserRole!): [User!]!
      }

      type Mutation {
        createUser(input: UserInput!): UserPayload!
        updateUser(id: ID!, input: UserInput!): UserPayload!
        deleteUser(id: ID!): DeleteUserPayload!
      }

      type Subscription {
        userCreated: User!
        userUpdated(id: ID): User!
      }

      type User {
        id: ID!
        username: String!
        email: String!
        profile: Profile
        posts: [Post!]!
        role: UserRole!
        createdAt: DateTime!
        updatedAt: DateTime
      }

      type Profile {
        userId: ID!
        firstName: String
        lastName: String
        avatar: String
        bio: String
        user: User!
      }

      type Post {
        id: ID!
        title: String!
        content: String!
        author: User!
        comments: [Comment!]!
        tags: [String!]
        createdAt: DateTime!
        updatedAt: DateTime
      }

      type Comment {
        id: ID!
        content: String!
        author: User!
        post: Post!
        createdAt: DateTime!
      }

      input UserInput {
        username: String!
        email: String!
        profile: ProfileInput
        role: UserRole
      }

      input ProfileInput {
        firstName: String
        lastName: String
        avatar: String
        bio: String
      }

      type UserPayload {
        user: User
        errors: [Error!]
      }

      type DeleteUserPayload {
        success: Boolean!
        errors: [Error!]
      }

      type Error {
        message: String!
        path: [String!]
      }

      enum UserRole {
        ADMIN
        EDITOR
        USER
      }

      scalar DateTime
    `);

    const result = await plugin(
      schema,
      [],
      {
        packageName: 'com.example.resolvers',
        withFuture: true,
        listType: 'List',
        useOptions: true,
        modelPackage: 'com.example.models'
      },
      { outputFile: 'src/main/scala/com/example/resolvers/Resolvers.scala' },
    );

    // Verify full structure with reasonable samples
    expect(result).toContain(`package com.example.resolvers`);
    expect(result).toContain(`import scala.concurrent.ExecutionContext`);
    expect(result).toContain(`import scala.language.implicitConversions`);
    expect(result).toContain(`import scala.concurrent.Future`);
    expect(result).toContain(`import sangria.schema._`);

    // Verify Query resolvers
    expect(result).toContain(`trait QueryResolvers {`);
    expect(result).toContain(`def getUser(context: Context, value: Value): Future[Option[com.example.models.User]]`);
    expect(result).toContain(`def listUsers(context: Context, value: Value): Future[List[com.example.models.User]]`);
    expect(result).toContain(`def searchUsers(context: Context, value: Value): Future[List[com.example.models.User]]`);
    expect(result).toContain(`def findByRole(context: Context, value: Value): Future[List[com.example.models.User]]`);

    // Verify Mutation resolvers
    expect(result).toContain(`trait MutationResolvers {`);
    expect(result).toContain(`def createUser(context: Context, value: Value): Future[com.example.models.UserPayload]`);
    expect(result).toContain(`def updateUser(context: Context, value: Value): Future[com.example.models.UserPayload]`);
    expect(result).toContain(`def deleteUser(context: Context, value: Value): Future[com.example.models.DeleteUserPayload]`);

    // Verify Subscription resolvers
    expect(result).toContain(`trait SubscriptionResolvers {`);
    expect(result).toContain(`def userCreated(context: Context, value: Value): Future[com.example.models.User]`);
    expect(result).toContain(`def userUpdated(context: Context, value: Value): Future[com.example.models.User]`);

    // Verify entity resolvers
    expect(result).toContain(`trait UserResolvers {`);
    expect(result).toContain(`def id(context: Context, value: Value): Future[String]`);
    expect(result).toContain(`def username(context: Context, value: Value): Future[String]`);
    expect(result).toContain(`def email(context: Context, value: Value): Future[String]`);
    expect(result).toContain(`def profile(context: Context, value: Value): Future[Option[com.example.models.Profile]]`);
    expect(result).toContain(`def posts(context: Context, value: Value): Future[List[com.example.models.Post]]`);
    expect(result).toContain(`def role(context: Context, value: Value): Future[UserRole]`);
    expect(result).toContain(`def createdAt(context: Context, value: Value): Future[java.time.LocalDateTime]`);
    expect(result).toContain(`def updatedAt(context: Context, value: Value): Future[Option[java.time.LocalDateTime]]`);
  });

  it('should generate a ZIO example with custom configuration', async () => {
    const schema = buildSchema(`
      type Query {
        userById(id: ID!): User
        allUsers: [User!]!
      }

      type User {
        id: ID!
        name: String!
        email: String!
      }
    `);

    const result = await plugin(
      schema,
      [],
      {
        packageName: 'com.example.zio.resolvers',
        withZIO: true,
        className: 'UserResolvers',
        useOpaqueTypes: true,
      },
      { outputFile: 'src/main/scala/com/example/zio/resolvers/UserResolvers.scala' },
    );

    expect(result).toContain(`package com.example.zio.resolvers`);
    expect(result).toContain(`import zio._`);
    expect(result).toContain(`trait UserResolvers {`);

    // Check Query resolvers
    expect(result).toContain(`trait QueryResolvers {`);
    expect(result).toContain(`def userById(context: Context, value: Value): ZIO[Any, Throwable, com.example.zio.models.UserEntity]`);
    expect(result).toContain(`def allUsers(context: Context, value: Value): ZIO[Any, Throwable, List[com.example.zio.models.UserEntity]]`);

    // Check User resolvers
    expect(result).toContain(`def id(context: Context, value: Value): ZIO[Any, Throwable, String]`);
    expect(result).toContain(`def name(context: Context, value: Value): ZIO[Any, Throwable, String]`);
    expect(result).toContain(`def email(context: Context, value: Value): ZIO[Any, Throwable, String]`);
  });

  it('should generate different return types based on configuration', async () => {
    const schema = buildSchema(`
      type Query {
        user: User
      }

      type User {
        id: ID!
        name: String
      }
    `);

    // Standard return types
    const standardResult = await plugin(
      schema,
      [],
      {},
      { outputFile: 'src/main/scala/standard/Resolvers.scala' },
    );
    expect(standardResult).toContain(`def user(context: Context, value: Value): User`);
    expect(standardResult).toContain(`def id(context: Context, value: Value): String`);
    expect(standardResult).toContain(`def name(context: Context, value: Value): String`);

    // Future return types
    const futureResult = await plugin(
      schema,
      [],
      { withFuture: true },
      { outputFile: 'src/main/scala/future/Resolvers.scala' },
    );
    expect(futureResult).toContain(`def user(context: Context, value: Value): Future[User]`);
    expect(futureResult).toContain(`def id(context: Context, value: Value): Future[String]`);
    expect(futureResult).toContain(`def name(context: Context, value: Value): Future[String]`);

    // ZIO return types
    const zioResult = await plugin(
      schema,
      [],
      { withZIO: true },
      { outputFile: 'src/main/scala/zio/Resolvers.scala' },
    );
    expect(zioResult).toContain(`def user(context: Context, value: Value): ZIO[Any, Throwable, User]`);
    expect(zioResult).toContain(`def id(context: Context, value: Value): ZIO[Any, Throwable, String]`);
    expect(zioResult).toContain(`def name(context: Context, value: Value): ZIO[Any, Throwable, String]`);

    // Using Options
    const optionsResult = await plugin(
      schema,
      [],
      { useOptions: true },
      { outputFile: 'src/main/scala/options/Resolvers.scala' },
    );
    expect(optionsResult).toContain(`def user(context: Context, value: Value): Option[User]`);
    expect(optionsResult).toContain(`def id(context: Context, value: Value): String`);
    expect(optionsResult).toContain(`def name(context: Context, value: Value): Option[String]`);

    // Combined Options and Future
    const combinedResult = await plugin(
      schema,
      [],
      { useOptions: true, withFuture: true },
      { outputFile: 'src/main/scala/combined/Resolvers.scala' },
    );
    expect(combinedResult).toContain(`def user(context: Context, value: Value): Future[Option[User]]`);
    expect(combinedResult).toContain(`def id(context: Context, value: Value): Future[String]`);
    expect(combinedResult).toContain(`def name(context: Context, value: Value): Future[Option[String]]`);
  });
});
