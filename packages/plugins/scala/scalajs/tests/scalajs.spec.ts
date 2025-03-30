import { buildSchema } from 'graphql';
import '@graphql-codegen/testing';
import { Types } from '@graphql-codegen/plugin-helpers';
import { plugin } from '../src/index.js';

const OUTPUT_FILE = 'com/scalajs/generated/Types.scala';

describe('Scala.js', () => {
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
      expect(defaultContent).toContain('package com.scalajs.generated');

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
      const content = await runPlugin(baseSchema, {
        scalars: {
          DateTime: 'java.time.LocalDateTime',
          Int: 'scala.Int',
        },
      });

      expect(content).toContain('type DateTime = java.time.LocalDateTime');
      expect(content).toContain('something: scala.Int');
    });

    it('Should generate correct case classes with Options', async () => {
      const content = await runPlugin(baseSchema, { useOptions: true });

      expect(content).toContain('case class User(');

      expect(content).toMatch(/name:\s*Option\[String\]/);
      expect(content).toMatch(/dateOfBirth:\s*Option\[java.time.LocalDateTime\]/);

      expect(content).toMatch(/id:\s*String/);
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
      expect(content).toContain('def fromJS(obj: js.Dynamic): SearchResult =');
      expect(content).toContain('case value: User =>');
      expect(content).toContain('case value: Group =>');
    });
  });

  describe('JavaScript Interop', () => {
    it('Should generate proper JS conversion methods', async () => {
      const content = await runPlugin(baseSchema);

      expect(content).toContain('@JSExport');
      expect(content).toContain('def fromJS(obj: js.Dynamic):');
      expect(content).toContain('def toJS(obj:');
      expect(content).toContain('js.Dynamic.literal()');
    });

    it('Should handle nullable fields in JS conversion', async () => {
      const content = await runPlugin(baseSchema, { useOptions: true });

      expect(content).toContain(
        'if js.isUndefined(obj.name) || obj.name == null then None else Some',
      );
      expect(content).toContain('asInstanceOf[');
    });
  });

  describe('Edge Cases', () => {
    it('Should handle empty schemas gracefully', async () => {
      const schema = buildSchema('type Query');
      const content = await runPlugin(schema);

      expect(content).toContain('package com.scalajs.generated');
      expect(content).toContain('import scala.scalajs.js');
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
      expect(content).toContain('RecursiveType.fromJS(item)');
    });

    it('Should handle complex nested union types', async () => {
      const nestedUnionSchema = buildSchema(`
        type User {
          id: ID!
          name: String!
        }

        type Group {
          id: ID!
          name: String!
        }

        type SuccessResult {
          users: [User!]!
          groups: [Group!]!
        }

        type ErrorMessage {
          message: String!
          code: Int!
        }

        union SearchResponse = SuccessResult | ErrorMessage

        type Query {
          search: SearchResponse!
        }
      `);

      const content = await runPlugin(nestedUnionSchema);

      expect(content).toContain('SuccessResult | ErrorMessage');
      expect(content).toContain('def fromJS(obj: js.Dynamic): SearchResponse');
      expect(content).toContain('case value: SuccessResult =>');
      expect(content).toContain('case value: ErrorMessage =>');
    });
  });
});
