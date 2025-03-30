import { buildSchema } from 'graphql';
import '@graphql-codegen/testing';
import { Types } from '@graphql-codegen/plugin-helpers';
import { plugin } from '../src/index.js';

const OUTPUT_FILE = 'com/scala/generated/Types.scala';

describe('Scala', () => {
  const baseSchema = buildSchema(`
    scalar DateTime

    type Query {
      me: User!
      user(id: ID!): User!
      searchUser(searchFields: SearchUser!): [User!]!
      updateUser(input: UpdateUserMetadataInput!): [User!]!
      authorize(roles: [UserRole]): Boolean
      search(query: String!): [SearchResult!]!
    }

    input SearchUser {
      username: String
      email: String
      name: String
      dateOfBirth: DateTime
      sort: ResultSort
      metadata: MetadataSearch
    }

    input MetadataSearch {
      something: Int
    }

    input UpdateUserMetadataInput {
      something: Int
    }

    enum ResultSort {
      ASC
      DESC
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
      friends(skip: Int, limit: Int): [User!]!
    }

    type Group implements Node {
      id: ID!
      name: String!
      members: [User!]!
    }

    union SearchResult = User | Group

    enum UserRole {
      ADMIN
      USER
      EDITOR
    }
  `);

  const runPlugin = async (schema = baseSchema, options = {}, outputFile = OUTPUT_FILE) => {
    const result = await plugin(schema, [], options, { outputFile });
    return (result as Types.ComplexPluginOutput).content;
  };

  describe('Basic Configuration', () => {
    it('Should handle package names correctly', async () => {
      const defaultContent = await runPlugin();
      expect(defaultContent).toContain('package com.scala.generated');

      const customContent = await runPlugin(baseSchema, { packageName: 'com.my.package' });
      expect(customContent).toContain('package com.my.package');

      const nestedContent = await runPlugin(
        baseSchema,
        {},
        'com/deeply/nested/structure/Types.scala',
      );
      expect(nestedContent).toContain('package com.deeply.nested.structure');
    });

    it('Should generate Scala 3 enums correctly', async () => {
      const content = await runPlugin(baseSchema);
      expect(content).toBeSimilarStringTo(`
        enum UserRole:
  case ADMIN
  case USER
          case EDITOR
      `);
    });
  });

  describe('Type Generation', () => {
    it('Should handle custom scalars and type mappings', async () => {
      const content = await plugin(
        baseSchema,
        [],
        {
          scalars: {
            Int: 'scala.Int',
          },
          packageName: 'com.scala.generated',
        },
        {
          outputFile: 'com/scala/generated/Types.scala',
        },
      );

      const contentStr = typeof content === 'string' ? content : content.content;
      expect(contentStr).toContain('type DateTime = java.time.LocalDateTime');
      expect(contentStr).toContain('something: scala.Int');
    });

    it('Should generate correct case classes with Options', async () => {
      const content = await plugin(
        baseSchema,
        [],
        {
          useOptions: true,
          packageName: 'com.scala.generated',
        },
        {
          outputFile: 'com/scala/generated/Types.scala',
        },
      );

      const contentStr = typeof content === 'string' ? content : content.content;
      expect(contentStr).toContain('case class User(');

      expect(contentStr).toMatch(/name:\s*Option\[String\]/);
      expect(contentStr).toMatch(/dateOfBirth:\s*Option\[java.time.LocalDateTime\]/);

      expect(contentStr).toMatch(/id:\s*String/);
    });

    it('Should handle interfaces and implementations', async () => {
      const content = await runPlugin(baseSchema);

      expect(content).toContain('trait Node:');
      expect(content).toContain('def id: String');
      expect(content).toContain('extends Node');
    });

    it('Should handle Scala 3 union types', async () => {
      const content = await runPlugin(baseSchema);

      expect(content).toContain('type SearchResult = User | Group');
    });

    it('Should correctly map DateTime when using custom scalars', async () => {
      const customScalarsSchema = buildSchema(`
        scalar DateTime

        type Query {
          today: DateTime
        }
      `);

      const customContent = await runPlugin(customScalarsSchema, {
        scalars: {
          DateTime: 'custom.DateTime'
        }
      });

      const defaultContent = await runPlugin(baseSchema);
      expect(defaultContent).toContain('type DateTime = java.time.LocalDateTime');
      expect(customContent).toContain('type DateTime = custom.DateTime');
    });
  });

  describe('Scala Helpers', () => {
    it('Should not generate companions when generateCompanionObjects is false', async () => {
      const content = await runPlugin(baseSchema, { generateCompanionObjects: false });

      expect(content).not.toContain('object User:');
      expect(content).not.toContain('object SearchUser:');
      expect(content).not.toContain('object UserRole:');
    });

    it('Should generate companion objects with helper methods when generateCompanionObjects is true', async () => {
      const content = await runPlugin(baseSchema, {
        generateCompanionObjects: true,
      });

      expect(content).toContain('object User:');
      expect(content).not.toContain('def apply(): User =');

      expect(content).toContain('object SearchUser:');
      expect(content).not.toContain('def apply(): SearchUser =');

      expect(content).toContain('object UserRole:');
      expect(content).toContain('def fromString(value: String): Option[UserRole]');

      expect(content).toContain('object SearchResult:');
      expect(content).toContain('def asUser(union: SearchResult): Option[User]');
      expect(content).toContain('def asGroup(union: SearchResult): Option[Group]');
    });
  });

  describe('Edge Cases', () => {
    it('Should handle empty schemas gracefully', async () => {
      const schema = buildSchema('type Query');
      const content = await runPlugin(schema);

      expect(content).toContain('package com.scala.generated');
      expect(content).toContain('import scala.util.Try');
      expect(content).toContain('case class Query');
    });

    it('Should handle complex nested types', async () => {
      const nestedSchema = buildSchema(`
        type Query {
          nestedList: [[String]]
          recursiveType: RecursiveType
        }
        type RecursiveType {
          id: ID!
          children: [RecursiveType!]
        }
      `);

      const content = await runPlugin(nestedSchema);

      expect(content).toContain('nestedList: List[List[String]]');
      expect(content).toContain('children: List[RecursiveType]');
    });

    it('Should handle DateTime properly', async () => {
      const defaultContent = await runPlugin(baseSchema);
      expect(defaultContent).toContain('type DateTime = java.time.LocalDateTime');

      const contentWithCustomType = await runPlugin(baseSchema, {
        scalars: {
          DateTime: 'custom.DateTime',
        },
      });

      expect(contentWithCustomType).toContain('type DateTime = custom.DateTime');
    });
  });

  describe('JSON Library Support', () => {
    it('Should generate Circe codecs when selected', async () => {
      const content = await runPlugin(baseSchema, {
        jsonLibrary: 'circe',
        generateCompanionObjects: true,
      });

      expect(content).toContain('import io.circe.*');
      expect(content).toContain('import io.circe.generic.semiauto.*');
      expect(content).toContain('import io.circe.syntax.*');

      expect(content).toContain('Encoder[ResultSort]');
      expect(content).toContain('Decoder[ResultSort]');

      expect(content).toContain('object UserRole:');
      expect(content).toContain('object SearchResult:');

      expect(content).toContain('given userRoleEncoder: Encoder[UserRole]');
      expect(content).toContain('given userRoleDecoder: Decoder[UserRole]');

      expect(content).toContain('given searchResultEncoder: Encoder[SearchResult]');
      expect(content).toContain('given searchResultDecoder: Decoder[SearchResult]');
    });

    it('Should generate ZIO JSON codecs when selected', async () => {
      const content = await runPlugin(baseSchema, {
        jsonLibrary: 'zio-json',
        generateCompanionObjects: true,
      });

      expect(content).toContain('import zio.json.*');

      expect(content).toContain('JsonEncoder[ResultSort]');
      expect(content).toContain('JsonDecoder[ResultSort]');

      expect(content).toContain('object UserRole:');
      expect(content).toContain('object SearchResult:');

      expect(content).toContain('given userRoleEncoder: JsonEncoder[UserRole]');
      expect(content).toContain('given userRoleDecoder: JsonDecoder[UserRole]');

      expect(content).toContain('given searchResultEncoder: JsonEncoder[SearchResult]');
      expect(content).toContain('given searchResultDecoder: JsonDecoder[SearchResult]');
    });

    it('Should generate Play JSON codecs when selected', async () => {
      const content = await runPlugin(baseSchema, {
        jsonLibrary: 'play-json',
        generateCompanionObjects: true,
      });

      expect(content).toContain('import play.api.libs.json.*');
      expect(content).toContain('import play.api.libs.functional.syntax.*');

      expect(content).toContain('Format[ResultSort]');

      expect(content).toContain('object UserRole:');
      expect(content).toContain('object SearchResult:');

      expect(content).toContain('given userRoleFormat: Format[UserRole]');

      expect(content).toContain('given searchResultFormat: Format[SearchResult]');

      expect(content).toContain('case UserRole.ADMIN => JsString');
    });

    it('Should not generate any JSON codecs when none is selected', async () => {
      const content = await runPlugin(baseSchema, {
        jsonLibrary: 'none',
        generateCompanionObjects: true,
      });

      expect(content).not.toContain('import io.circe');
      expect(content).not.toContain('import zio.json');
      expect(content).not.toContain('import play.api.libs.json');

      expect(content).not.toContain('Encoder[User]');
      expect(content).not.toContain('Decoder[User]');
      expect(content).not.toContain('JsonEncoder[User]');
      expect(content).not.toContain('Format[User]');
    });

    it('Should work correctly with companion objects disabled', async () => {
      const content = await runPlugin(baseSchema, {
        jsonLibrary: 'circe',
        generateCompanionObjects: false
      });

      expect(content).toContain('import io.circe.*');
      expect(content).not.toContain('given userEncoder');
      expect(content).not.toContain('given userDecoder');
    });
  });
});
