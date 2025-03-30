import { buildSchema } from 'graphql';
import { plugin } from '../src';

const OUTPUT_FILE = 'src/main/scala/com/scala/generated/Resolvers.scala';

describe('Scala Resolvers', () => {
  const schema = buildSchema(/* GraphQL */ `
    scalar DateTime

    type Query {
      me: User!
      users: [User!]!
      nodeById(id: ID!): Node
    }

    interface Node {
      id: ID!
    }

    type User implements Node {
      id: ID!
      username: String!
      email: String!
      name: String
      dateOfBirth: DateTime
      friends: [User!]
    }

    type Chat implements Node {
      id: ID!
      users: [User!]!
      title: String
      lastMessage: String
    }

    union SearchResult = Chat | User

    enum UserRole {
      ADMIN
      USER
      GUEST
    }

    input UserInput {
      username: String!
      email: String!
      role: UserRole = USER
    }
  `);

  it('Should generate traits correctly', async () => {
    const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

    // Check package and imports
    expect(result).toContain('package com.scala.generated');
    expect(result).toContain('import scala.concurrent.ExecutionContext');
    expect(result).toContain('import sangria.schema._');

    // Check Query resolver
    expect(result).toContain('trait QueryResolvers {');
    expect(result).toContain('def me(context: Context, value: Value): User');
    expect(result).toContain('def users(context: Context, value: Value): List[User]');
    expect(result).toContain('def nodeById(context: Context, value: Value): Node');

    // Check User resolver
    expect(result).toContain('trait UserResolvers {');
    expect(result).toContain('def id(context: Context, value: Value): String');
    expect(result).toContain('def username(context: Context, value: Value): String');
    expect(result).toContain('def email(context: Context, value: Value): String');
    expect(result).toContain('def name(context: Context, value: Value): String');
    expect(result).toContain('def dateOfBirth(context: Context, value: Value): java.time.LocalDateTime');
    expect(result).toContain('def friends(context: Context, value: Value): List[User]');
  });

  it('Should generate list types correctly', async () => {
    const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

    expect(result).toContain('trait ChatResolvers {');
    expect(result).toContain('def id(context: Context, value: Value): String');
    expect(result).toContain('def users(context: Context, value: Value): List[User]');
    expect(result).toContain('def title(context: Context, value: Value): String');
    expect(result).toContain('def lastMessage(context: Context, value: Value): String');
  });

  it('Should generate nested list types correctly', async () => {
    const nestedListSchema = buildSchema(`type Query { data: [[[[String]]]] }`);
    const result = await plugin(nestedListSchema, [], {}, { outputFile: OUTPUT_FILE });

    expect(result).toContain('def data(context: Context, value: Value): List[List[List[List[String]]]]');
  });

  it('Should generate union correctly', async () => {
    const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

    expect(result).toContain('trait SearchResultResolver {');
    expect(result).toContain('def resolveType(value: Any): Option[ObjectType[Any, Any]]');
  });

  it('Should generate interfaces correctly with TypeResolver', async () => {
    const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

    expect(result).toContain('import sangria.schema.TypeResolver');
    expect(result).toContain('trait NodeResolver {');
    expect(result).toContain('def resolveType(value: Any): Option[ObjectType[Any, Any]]');
    expect(result).toContain('def id(context: Context, value: Value): String');
  });

  it('Should use the correct package name by default', async () => {
    const result = await plugin(schema, [], {}, { outputFile: OUTPUT_FILE });

    expect(result).toContain('package com.scala.generated');
  });

  it('Should use the package name provided from the config', async () => {
    const result = await plugin(
      schema,
      [],
      { packageName: 'com.my.package' },
      { outputFile: OUTPUT_FILE },
    );

    expect(result).toContain('package com.my.package');
  });

  it('Should generate Future return types when withFuture is true', async () => {
    const result = await plugin(
      schema,
      [],
      { withFuture: true },
      { outputFile: OUTPUT_FILE },
    );

    expect(result).toContain('import scala.concurrent.Future');
    expect(result).toContain('def me(context: Context, value: Value): Future[User]');
    expect(result).toContain('def users(context: Context, value: Value): Future[List[User]]');
    expect(result).toContain('def id(context: Context, value: Value): Future[String]');
  });

  it('Should generate ZIO return types when withZIO is true', async () => {
    const result = await plugin(
      schema,
      [],
      { withZIO: true },
      { outputFile: OUTPUT_FILE },
    );

    expect(result).toContain('import zio._');
    expect(result).toContain('def me(context: Context, value: Value): ZIO[Any, Throwable, User]');
    expect(result).toContain('def users(context: Context, value: Value): ZIO[Any, Throwable, List[User]]');
  });

  it('Should use custom list type correctly', async () => {
    const result = await plugin(
      schema,
      [],
      { listType: 'Vector' },
      { outputFile: OUTPUT_FILE },
    );

    expect(result).toContain('def users(context: Context, value: Value): Vector[User]');
    expect(result).toContain('def friends(context: Context, value: Value): Vector[User]');
  });

  it('Should support Option for nullable fields when useOptions is true', async () => {
    const result = await plugin(
      schema,
      [],
      { useOptions: true },
      { outputFile: OUTPUT_FILE },
    );

    expect(result).toContain('def name(context: Context, value: Value): Option[String]');
    expect(result).toContain('def friends(context: Context, value: Value): Option[List[User]]');
    expect(result).toContain('def title(context: Context, value: Value): Option[String]');
  });

  it('Should use the class name provided in config', async () => {
    const result = await plugin(
      schema,
      [],
      { className: 'CustomResolvers' },
      { outputFile: OUTPUT_FILE },
    );

    expect(result).toContain('trait CustomResolvers {');
  });

  it('Should support class members prefix', async () => {
    const result = await plugin(
      schema,
      [],
      { classMembersPrefix: '_' },
      { outputFile: OUTPUT_FILE },
    );

    expect(result).toContain('def _me(context: Context, value: Value): User');
    expect(result).toContain('def _id(context: Context, value: Value): String');
    expect(result).toContain('def _username(context: Context, value: Value): String');
  });
});
