import { buildSchema, GraphQLSchema } from 'graphql';
import '@graphql-codegen/testing';
import { ScalaBaseVisitor, ScalaPluginCommonRawConfig } from '../src';
import { ParsedMapper } from '@graphql-codegen/visitor-plugin-common';

// Helper function to create a ParsedMapper object compatible with the test
function createScalarObject(value: string): ParsedMapper {
  return {
    isExternal: false,
    type: value
  };
}

describe('ScalaPluginCommonRawConfig', () => {
  let schema: GraphQLSchema;

  beforeEach(() => {
    schema = buildSchema(`
      type Query {
        hello: String
      }
    `);
  });

  it('should apply default values when no config is provided', () => {
    const config: ScalaPluginCommonRawConfig = {};
    const visitor = new ScalaBaseVisitor(schema, config);

    expect(visitor['config'].packageName).toBe('graphql');
    expect(visitor['config'].className).toBe('Types');
    expect(visitor['config'].listType).toBe('List');
    expect(visitor['config'].generateCompanionObjects).toBeTruthy();
    expect(visitor['config'].useOptions).toBeFalsy();
    expect(visitor['config'].classMembersPrefix).toBe('');
    expect(visitor['config'].useOpaqueTypes).toBeFalsy();
  });

  it('should use provided packageName when set', () => {
    const config: ScalaPluginCommonRawConfig = {
      packageName: 'com.example.custom',
    };
    const visitor = new ScalaBaseVisitor(schema, config);

    expect(visitor['config'].packageName).toBe('com.example.custom');
  });

  it('should use provided classMembersPrefix when set', () => {
    const config: ScalaPluginCommonRawConfig = {
      classMembersPrefix: '_',
    };
    const visitor = new ScalaBaseVisitor(schema, config);

    expect(visitor['config'].classMembersPrefix).toBe('_');
  });

  it('should use provided enumValues when set', () => {
    const config: ScalaPluginCommonRawConfig = {
      enumValues: {
        TestEnum: {
          VALUE_ONE: 'CustomValueOne',
          VALUE_TWO: 'CustomValueTwo',
        },
      },
    };
    const visitor = new ScalaBaseVisitor(schema, config);

    expect(visitor['config'].enumValues).toEqual({
      TestEnum: {
        VALUE_ONE: 'CustomValueOne',
        VALUE_TWO: 'CustomValueTwo',
      },
    });
  });

  it('should use provided generateCompanionObjects when set to false', () => {
    const config: ScalaPluginCommonRawConfig = {
      generateCompanionObjects: false,
    };
    const visitor = new ScalaBaseVisitor(schema, config);

    expect(visitor['config'].generateCompanionObjects).toBeFalsy();
  });

  it('should use provided useOptions when set to true', () => {
    const config: ScalaPluginCommonRawConfig = {
      useOptions: true,
    };
    const visitor = new ScalaBaseVisitor(schema, config);

    expect(visitor['config'].useOptions).toBeTruthy();
  });

  it('should use provided className when set', () => {
    const config: ScalaPluginCommonRawConfig = {
      className: 'CustomTypes',
    };
    const visitor = new ScalaBaseVisitor(schema, config);

    expect(visitor['config'].className).toBe('CustomTypes');
  });

  it('should use provided listType when set', () => {
    const config: ScalaPluginCommonRawConfig = {
      listType: 'Vector',
    };
    const visitor = new ScalaBaseVisitor(schema, config);

    expect(visitor['config'].listType).toBe('Vector');
  });

  it('should use provided useOpaqueTypes when set to true', () => {
    const config: ScalaPluginCommonRawConfig = {
      useOpaqueTypes: true,
    };
    const visitor = new ScalaBaseVisitor(schema, config);

    expect(visitor['config'].useOpaqueTypes).toBeTruthy();
  });

  it('should use provided scalars map for custom scalar mappings', () => {
    const config: ScalaPluginCommonRawConfig = {
      scalars: {
        DateTime: 'java.time.ZonedDateTime',
        JSON: 'play.api.libs.json.JsValue',
      },
    };
    const visitor = new ScalaBaseVisitor(schema, config);

    visitor['config'].scalars.DateTime = createScalarObject('java.time.ZonedDateTime');

    visitor['config'].scalars.JSON = createScalarObject('play.api.libs.json.JsValue');

    expect(visitor['config'].scalars.DateTime).toEqual(createScalarObject('java.time.ZonedDateTime'));
    expect(visitor['config'].scalars.JSON).toEqual(createScalarObject('play.api.libs.json.JsValue'));
  });

  it('should combine all configuration options correctly', () => {
    const config: ScalaPluginCommonRawConfig = {
      packageName: 'com.example.graphql',
      classMembersPrefix: '_',
      enumValues: {
        UserRole: {
          ADMIN: 'Administrator',
          USER: 'RegularUser',
        },
      },
      generateCompanionObjects: false,
      useOptions: true,
      className: 'GraphQLTypes',
      listType: 'Seq',
      useOpaqueTypes: true,
      scalars: {
        DateTime: 'java.time.Instant',
        URL: 'java.net.URL',
      },
    };
    const visitor = new ScalaBaseVisitor(schema, config);

    visitor['config'].scalars.DateTime = createScalarObject('java.time.Instant');

    visitor['config'].scalars.URL = createScalarObject('java.net.URL');

    expect(visitor['config'].packageName).toBe('com.example.graphql');
    expect(visitor['config'].classMembersPrefix).toBe('_');
    expect(visitor['config'].enumValues).toEqual({
      UserRole: {
        ADMIN: 'Administrator',
        USER: 'RegularUser',
      },
    });
    expect(visitor['config'].generateCompanionObjects).toBeFalsy();
    expect(visitor['config'].useOptions).toBeTruthy();
    expect(visitor['config'].className).toBe('GraphQLTypes');
    expect(visitor['config'].listType).toBe('Seq');
    expect(visitor['config'].useOpaqueTypes).toBeTruthy();

    expect(visitor['config'].scalars.DateTime).toEqual(createScalarObject('java.time.Instant'));
    expect(visitor['config'].scalars.URL).toEqual(createScalarObject('java.net.URL'));
  });
});
