import { buildSchema, GraphQLSchema } from 'graphql';
import '@graphql-codegen/testing';
import { ScalaBaseVisitor, ScalaPluginCommonRawConfig, ScalaResolverParsedConfig } from '../src';
import { ParsedMapper } from '@graphql-codegen/visitor-plugin-common';
import { Kind } from 'graphql';

// Helper function to create a ParsedMapper object compatible with the test
function createScalarObject(value: string): ParsedMapper {
  return {
    isExternal: false,
    type: value
  };
}

describe('ScalaBaseVisitor', () => {
  let schema: GraphQLSchema;

  beforeEach(() => {
    schema = buildSchema(`
      scalar DateTime

      type Query {
        me: User!
        user(id: ID!): User!
        searchUser(name: String): [User!]!
      }

      interface Node {
        id: ID!
      }

      type User implements Node {
        id: ID!
        username: String!
        email: String!
        name: String
        age: Int
        isActive: Boolean
        height: Float
        createdAt: DateTime
        friends: [User!]
      }

      enum UserRole {
        ADMIN
        USER
        EDITOR
      }

      input UserInput {
        username: String!
        email: String!
        name: String
        age: Int
      }

      union SearchResult = User
    `);
  });

  describe('constructor and initialization', () => {
    it('should initialize with default values', () => {
      const visitor = new ScalaBaseVisitor<ScalaPluginCommonRawConfig, ScalaResolverParsedConfig>(
        schema,
        {},
      );

      expect(visitor['config'].packageName).toBe('graphql');
      expect(visitor['config'].className).toBe('Types');
      expect(visitor['config'].listType).toBe('List');
      expect(visitor['config'].generateCompanionObjects).toBeTruthy();
      expect(visitor['config'].useOptions).toBeFalsy();
      expect(visitor['config'].classMembersPrefix).toBe('');
      expect(visitor['config'].useOpaqueTypes).toBeFalsy();
    });

    it('should use custom config values when provided', () => {
      const config: ScalaPluginCommonRawConfig = {
        packageName: 'custom.package',
        className: 'CustomTypes',
        listType: 'Vector',
        generateCompanionObjects: false,
        useOptions: true,
        classMembersPrefix: '_',
        useOpaqueTypes: true,
      };

      const visitor = new ScalaBaseVisitor<ScalaPluginCommonRawConfig, ScalaResolverParsedConfig>(
        schema,
        config,
      );

      expect(visitor['config'].packageName).toBe('custom.package');
      expect(visitor['config'].className).toBe('CustomTypes');
      expect(visitor['config'].listType).toBe('Vector');
      expect(visitor['config'].generateCompanionObjects).toBeFalsy();
      expect(visitor['config'].useOptions).toBeTruthy();
      expect(visitor['config'].classMembersPrefix).toBe('_');
      expect(visitor['config'].useOpaqueTypes).toBeTruthy();
    });
  });

  describe('getPackage', () => {
    it('should use packageName from config when provided', () => {
      const visitor = new ScalaBaseVisitor<ScalaPluginCommonRawConfig, ScalaResolverParsedConfig>(
        schema,
        { packageName: 'com.example.graphql' },
      );

      expect(visitor.getPackage()).toBe('package com.example.graphql');
    });

    it('should derive package name from output file path when no packageName is provided', () => {
      const visitor = new ScalaBaseVisitor<ScalaPluginCommonRawConfig, ScalaResolverParsedConfig>(
        schema,
        {},
        { outputFile: 'com/example/types/GraphQL.scala' },
      );

      expect(visitor.getPackage()).toBe('package graphql');
    });

    it('should use default package name when neither packageName nor outputFile is provided', () => {
      const visitor = new ScalaBaseVisitor<ScalaPluginCommonRawConfig, ScalaResolverParsedConfig>(
        schema,
        {},
      );

      expect(visitor.getPackage()).toBe('package graphql');
    });
  });

  describe('getScalaType', () => {
    it('should properly handle scalar types', () => {
      // Create a simple schema with basic types
      const schema = buildSchema(`
        type Query {
          id: ID
          name: String
          height: Float
        }
      `);

      const visitor = new ScalaBaseVisitor(schema, {});

      // Mock the type nodes to test directly
      const mockIdType = { kind: Kind.NAMED_TYPE, name: { value: 'ID' } } as any;
      const mockStringType = { kind: Kind.NAMED_TYPE, name: { value: 'String' } } as any;
      const mockFloatType = { kind: Kind.NAMED_TYPE, name: { value: 'Float' } } as any;

      expect(visitor['getScalaType'](mockStringType)).toBe('String');
      expect(visitor['getScalaType'](mockIdType)).toBe('String');
      expect(visitor['getScalaType'](mockFloatType)).toBe('Double');
    });

    it('should handle list types correctly', () => {
      const visitor = new ScalaBaseVisitor<ScalaPluginCommonRawConfig, ScalaResolverParsedConfig>(
        schema,
        {},
      );
      const userType = schema.getType('User');

      if (!userType || !userType.astNode) {
        fail('User type not found in schema');
      }

      const fields = (userType.astNode as any).fields;
      const friendsField = fields.find((f: any) => f.name.value === 'friends');

      expect(visitor['getScalaType'](friendsField.type)).toBe('List[User]');
    });

    it('should use custom list type when provided', () => {
      const visitor = new ScalaBaseVisitor<ScalaPluginCommonRawConfig, ScalaResolverParsedConfig>(
        schema,
        { listType: 'Vector' },
      );
      const userType = schema.getType('User');

      if (!userType || !userType.astNode) {
        fail('User type not found in schema');
      }

      const fields = (userType.astNode as any).fields;
      const friendsField = fields.find((f: any) => f.name.value === 'friends');

      expect(visitor['getScalaType'](friendsField.type)).toBe('Vector[User]');
    });

    it('should handle non-null list types correctly', () => {
      const visitor = new ScalaBaseVisitor<ScalaPluginCommonRawConfig, ScalaResolverParsedConfig>(
        schema,
        {},
      );
      const queryType = schema.getType('Query');

      if (!queryType || !queryType.astNode) {
        fail('Query type not found in schema');
      }

      const fields = (queryType.astNode as any).fields;
      const searchUserField = fields.find((f: any) => f.name.value === 'searchUser');

      expect(visitor['getScalaType'](searchUserField.type)).toBe('List[User]');
    });

    it('should use Option for nullable types when useOptions is true', () => {
      const visitor = new ScalaBaseVisitor<ScalaPluginCommonRawConfig, ScalaResolverParsedConfig>(
        schema,
        { useOptions: true },
      );
      const userType = schema.getType('User');

      if (!userType || !userType.astNode) {
        fail('User type not found in schema');
      }

      const fields = (userType.astNode as any).fields;
      const nameField = fields.find((f: any) => f.name.value === 'name');

      expect(visitor['getScalaType'](nameField.type)).toBe('Option[String]');
    });
  });

  describe('formatFieldName', () => {
    it('should add prefix to field names when classMembersPrefix is specified', () => {
      const visitor = new ScalaBaseVisitor<ScalaPluginCommonRawConfig, ScalaResolverParsedConfig>(
        schema,
        { classMembersPrefix: '_' },
      );

      expect(visitor['formatFieldName']('name')).toBe('_name');
      expect(visitor['formatFieldName']('age')).toBe('_age');
    });

    it('should not modify field names when classMembersPrefix is not specified', () => {
      const visitor = new ScalaBaseVisitor<ScalaPluginCommonRawConfig, ScalaResolverParsedConfig>(
        schema,
        {},
      );

      expect(visitor['formatFieldName']('name')).toBe('name');
      expect(visitor['formatFieldName']('age')).toBe('age');
    });
  });

  describe('ScalarTypeDefinition', () => {
    it('should generate correct scalar type definitions', () => {
      const visitor = new ScalaBaseVisitor<ScalaPluginCommonRawConfig, ScalaResolverParsedConfig>(
        schema,
        {},
      );
      const dateTimeType = schema.getType('DateTime');

      if (!dateTimeType || !dateTimeType.astNode) {
        fail('DateTime type not found in schema');
      }

      expect(visitor.ScalarTypeDefinition(dateTimeType.astNode as any)).toBe(
        'type DateTime = java.time.LocalDateTime',
      );
    });

    it('should use custom scalar mappings when provided', () => {
      const customConfig = {
        scalars: {
          DateTime: 'java.util.Date',
        },
      };

      const visitor = new ScalaBaseVisitor<ScalaPluginCommonRawConfig, ScalaResolverParsedConfig>(
        schema,
        customConfig,
      );

      visitor['config'].scalars.DateTime = createScalarObject('java.util.Date');

      const dateTimeType = schema.getType('DateTime');

      if (!dateTimeType || !dateTimeType.astNode) {
        fail('DateTime type not found in schema');
      }

      expect(visitor.ScalarTypeDefinition(dateTimeType.astNode as any)).toBe(
        'type DateTime = java.util.Date',
      );
    });
  });

  describe('generateCustomScalars', () => {
    it('should generate custom scalar type definitions when needed', () => {
      const schema = buildSchema(`
        scalar CustomScalar
      `);

      const visitor = new ScalaBaseVisitor(schema, {
        scalars: {
          CustomScalar: 'com.example.CustomType',
        },
      });

      const results = visitor.generateCustomScalars();

      expect(results.some(s => s === 'type CustomScalar = com.example.CustomType')).toBeTruthy();
    });
  });
});
