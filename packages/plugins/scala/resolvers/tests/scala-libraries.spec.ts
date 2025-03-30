import { buildSchema } from 'graphql';
import { plugin } from '../src';

describe('Scala GraphQL Library Integration', () => {
  const schema = buildSchema(`
    type Query {
      user(id: ID!): User
      users: [User!]!
    }

    type User {
      id: ID!
      name: String!
      email: String!
    }
  `);

  describe('Sangria', () => {
    it('should generate Sangria-compatible resolvers', async () => {
      const result = await plugin(
        schema,
        [],
        {
          packageName: 'com.example.sangria',
        },
        { outputFile: 'src/main/scala/com/example/sangria/SangriaResolvers.scala' },
      );

      // Sangria uses TypeResolver and ObjectType
      expect(result).toContain('import sangria.schema._');
      expect(result).toContain('trait Types {');
      expect(result).toContain('given ExecutionContext = scala.concurrent.ExecutionContext.global');

      // Check resolver format matches Sangria's expectations
      expect(result).toContain('def user(context: Context, value: Value): User');
      expect(result).toContain('def id(context: Context, value: Value): String');
    });

    it('should support Sangria with Future', async () => {
      const result = await plugin(
        schema,
        [],
        {
          packageName: 'com.example.sangria',
          withFuture: true,
        },
        { outputFile: 'src/main/scala/com/example/sangria/SangriaFutureResolvers.scala' },
      );

      expect(result).toContain('import scala.concurrent.Future');
      expect(result).toContain('def user(context: Context, value: Value): Future[User]');
    });
  });

  describe('ZIO integration', () => {
    it('should generate ZIO-compatible resolvers', async () => {
      const result = await plugin(
        schema,
        [],
        {
          packageName: 'com.example.zio',
          withZIO: true,
        },
        { outputFile: 'src/main/scala/com/example/zio/ZIOResolvers.scala' },
      );

      // ZIO imports and return types
      expect(result).toContain('import zio._');
      expect(result).toContain('def user(context: Context, value: Value): ZIO[Any, Throwable, User]');
      expect(result).toContain('def id(context: Context, value: Value): ZIO[Any, Throwable, String]');
    });
  });

  describe('Error handling', () => {
    it('should include proper error handling for interface resolvers', async () => {
      const interfaceSchema = buildSchema(`
        interface Node {
          id: ID!
          name: String!
        }

        type User implements Node {
          id: ID!
          name: String!
          email: String!
        }

        type Product implements Node {
          id: ID!
          name: String!
          price: Float!
        }

        type Query {
          node(id: ID!): Node
        }
      `);

      const result = await plugin(
        interfaceSchema,
        [],
        {
          packageName: 'com.example.error',
        },
        { outputFile: 'src/main/scala/com/example/error/ErrorHandlingResolvers.scala' },
      );

      // Check that interface methods have default implementations with proper error handling
      expect(result).toContain('trait NodeResolver {');
      expect(result).toContain('def resolveType(value: Any): Option[ObjectType[Any, Any]]');

      // Check for default implementations with NotImplementedError
      expect(result).toContain('def id(context: Context, value: Value): String{');
      expect(result).toContain('throw new NotImplementedError("id resolver not implemented")');

      expect(result).toContain('def name(context: Context, value: Value): String{');
      expect(result).toContain('throw new NotImplementedError("name resolver not implemented")');
    });
  });

  describe('Type system integrations', () => {
    it('should handle Options and nullable fields correctly', async () => {
      const nullableSchema = buildSchema(`
        type Query {
          user: User
        }

        type User {
          id: ID!
          name: String
          email: String!
        }
      `);

      const result = await plugin(
        nullableSchema,
        [],
        {
          packageName: 'com.example.nullable',
          useOptions: true,
        },
        { outputFile: 'src/main/scala/com/example/nullable/NullableResolvers.scala' },
      );

      // Check that nullable fields use Option
      expect(result).toContain('def user(context: Context, value: Value): Option[User]');
      expect(result).toContain('def name(context: Context, value: Value): Option[String]');

      // Non-nullable fields should not use Option
      expect(result).toContain('def id(context: Context, value: Value): String');
      expect(result).toContain('def email(context: Context, value: Value): String');
    });
  });
});
