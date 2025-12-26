import { buildClientSchema, GraphQLSchema, versionInfo as graphqlVersion, parse } from 'graphql';
import { mergeOutputs, Types } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { plugin as tsPlugin, TypeScriptPluginConfig } from '@graphql-codegen/typescript';
import {
  plugin as tsDocumentsPlugin,
  TypeScriptDocumentsPluginConfig,
} from '@graphql-codegen/typescript-operations';
import { DocumentMode } from '@graphql-codegen/visitor-plugin-common';
import { RawGraphQLRequestPluginConfig } from '../src/config.js';
import { plugin } from '../src/index.js';

// graphql did not add support for operation descriptions until version 16.12.0
// https://github.com/graphql/graphql-js/commit/364f17fd3519fe2daf7caa0238f4f977bd079012
const graphqlQueryDescriptions =
  graphqlVersion.major > 16 || (graphqlVersion.major === 16 && graphqlVersion.minor >= 12);

describe('graphql-request', () => {
  const schema = buildClientSchema(require('../../../../../dev-test/githunt/schema.json'));

  // `compatibleIt` can be restored to just `it` after older graphql support is dropped.
  const compatibleIt = (testName: string, fn: Parameters<typeof it>[1]) => {
    const compatName = `${testName} with graphql < 16.12.0`;
    if (graphqlQueryDescriptions) {
      it.skip(compatName, () => {});
      it(testName, fn);
    } else {
      it.skip(testName, () => {});
      it(compatName, fn);
    }
  };

  const basicDoc = parse(/* GraphQL */ `
    ${graphqlQueryDescriptions
      ? `
    """description (becomes JSDoc)"""`
      : ''}
    query feed {
      feed {
        id
        commentCount
        repository {
          owner {
            avatar_url
          }
        }
      }
    }

    query feed2($v: String!) {
      feed {
        id
      }
    }

    query feed3($v: String) {
      feed {
        id
      }
    }

    query feed4($v: String! = "TEST") {
      feed {
        id
      }
    }
  `);

  const validate = async (
    content: Types.PluginOutput,
    config: TypeScriptPluginConfig &
      TypeScriptDocumentsPluginConfig &
      RawGraphQLRequestPluginConfig,
    docs: Types.DocumentFile[],
    pluginSchema: GraphQLSchema,
    usage: string,
  ) => {
    const m = mergeOutputs([
      await tsPlugin(pluginSchema, docs, config, { outputFile: '' }),
      await tsDocumentsPlugin(pluginSchema, docs, config),
      content,
      usage,
    ]);

    validateTs(m);

    return m;
  };

  describe('sdk', () => {
    compatibleIt('Should generate a correct wrap method', async () => {
      const config = {};
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
async function test() {
  const client = new GraphQLClient('');
  const sdk = getSdk(client);

  await sdk.feed();
  await sdk.feed3();
  await sdk.feed4();

  const result = await sdk.feed2({ v: "1" });

  if (result.feed) {
    if (result.feed[0]) {
      const id = result.feed[0].id
    }
  }
}`;
      const output = await validate(result, config, docs, schema, usage);

      expect(result.content).toContain(
        `({ document: FeedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'feed', 'query', variables);`,
      );
      expect(output).toMatchSnapshot();
    });

    compatibleIt('Should generate a correct wrap method with documentMode=string', async () => {
      const config = { documentMode: DocumentMode.string };
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
async function test() {
  const client = new GraphQLClient('');
  const sdk = getSdk(client);

  await sdk.feed();
  await sdk.feed3();
  await sdk.feed4();

  const result = await sdk.feed2({ v: "1" });

  if (result.feed) {
    if (result.feed[0]) {
      const id = result.feed[0].id
    }
  }
}`;
      const output = await validate(result, config, docs, schema, usage);

      expect(output).toMatchSnapshot();
    });

    compatibleIt('Should allow passing wrapper arg to generated getSdk', async () => {
      const config = { documentMode: DocumentMode.string };
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
async function test() {
  const client = new GraphQLClient('');
  const functionWrapper: SdkFunctionWrapper = async <T>(action: () => Promise<T>): Promise<T> => {
    console.log('before');
    const result = await action();
    console.log('after');
    return result;
  }

  const sdk = getSdk(client, functionWrapper);

  await sdk.feed();
  await sdk.feed3();
  await sdk.feed4();

  const result = await sdk.feed2({ v: "1" });

  if (result.feed) {
    if (result.feed[0]) {
      const id = result.feed[0].id
    }
  }
}`;
      const output = await validate(result, config, docs, schema, usage);

      expect(output).toMatchSnapshot();
    });

    compatibleIt('Should support useTypeImports', async () => {
      const config = { useTypeImports: true };
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
async function test() {
  const Client = require('graphql-request').GraphQLClient;
  const client = new Client('');
  const sdk = getSdk(client);

  await sdk.feed();
  await sdk.feed3();
  await sdk.feed4();

  const result = await sdk.feed2({ v: "1" });

  if (result.feed) {
    if (result.feed[0]) {
      const id = result.feed[0].id
    }
  }
}`;
      const output = await validate(result, config, docs, schema, usage);

      expect(output).toMatchSnapshot();
    });

    compatibleIt(
      'Should support emitLegacyCommonJSImports: false by emitting imports with extensions',
      async () => {
        const config = { emitLegacyCommonJSImports: false };
        const docs = [{ location: '', document: basicDoc }];
        const result = (await plugin(schema, docs, config, {
          outputFile: 'graphql.ts',
        })) as Types.ComplexPluginOutput;

        const usage = `
async function test() {
  const Client = require('graphql-request').GraphQLClient;
  const client = new Client('');
  const sdk = getSdk(client);

  await sdk.feed();
  await sdk.feed3();
  await sdk.feed4();

  const result = await sdk.feed2({ v: "1" });

  if (result.feed) {
    if (result.feed[0]) {
      const id = result.feed[0].id
    }
  }
}`;
        const output = await validate(result, config, docs, schema, usage);

        expect(output).toMatchSnapshot();
      },
    );

    compatibleIt('Should support rawRequest when documentMode = "documentNode"', async () => {
      const config = { rawRequest: true };
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
async function test() {
  const Client = require('graphql-request').GraphQLClient;
  const client = new Client('');
  const sdk = getSdk(client);

  await sdk.feed();
  await sdk.feed3();
  await sdk.feed4();

  const result = await sdk.feed2({ v: "1" });

  if (result.feed) {
    if (result.feed[0]) {
      const id = result.feed[0].id
    }
  }
}`;
      const output = await validate(result, config, docs, schema, usage);

      expect(output).toMatchSnapshot();
    });

    compatibleIt(
      'Should not import print as type when supporting useTypeImports and rawRequest and documentMode = "documentNode"',
      async () => {
        const config = { rawRequest: true, useTypeImports: true };
        const docs = [{ location: '', document: basicDoc }];
        const result = (await plugin(schema, docs, config, {
          outputFile: 'graphql.ts',
        })) as Types.ComplexPluginOutput;

        const usage = `
async function test() {
  const Client = require('graphql-request').GraphQLClient;
  const client = new Client('');
  const sdk = getSdk(client);

  await sdk.feed();
  await sdk.feed3();
  await sdk.feed4();

  const result = await sdk.feed2({ v: "1" });

  if (result.feed) {
    if (result.feed[0]) {
      const id = result.feed[0].id
    }
  }
}`;
        const output = await validate(result, config, docs, schema, usage);

        expect(output).toMatchSnapshot();
      },
    );

    compatibleIt(
      'Should only import GraphQLError when rawRequest is true and documentMode = "string"',
      async () => {
        const config = { rawRequest: true, documentMode: DocumentMode.string };
        const docs = [{ location: '', document: basicDoc }];
        const result = (await plugin(schema, docs, config, {
          outputFile: 'graphql.ts',
        })) as Types.ComplexPluginOutput;

        const usage = `
async function test() {
  const Client = require('graphql-request').GraphQLClient;
  const client = new Client('');
  const sdk = getSdk(client);

  await sdk.feed();
  await sdk.feed3();
  await sdk.feed4();

  const result = await sdk.feed2({ v: "1" });

  if (result.feed) {
    if (result.feed[0]) {
      const id = result.feed[0].id
    }
  }
}`;
        const output = await validate(result, config, docs, schema, usage);

        expect(output).toMatchSnapshot();
      },
    );

    compatibleIt(
      'Should support extensionType when rawRequest is true and documentMode = "DocumentNode"',
      async () => {
        const config = { rawRequest: true, extensionsType: 'unknown' };
        const docs = [{ location: '', document: basicDoc }];
        const result = (await plugin(schema, docs, config, {
          outputFile: 'graphql.ts',
        })) as Types.ComplexPluginOutput;

        const usage = `
async function test() {
  const Client = require('graphql-request').GraphQLClient;
  const client = new Client('');
  const sdk = getSdk(client);

  await sdk.feed();
  await sdk.feed3();
  await sdk.feed4();

  const result = await sdk.feed2({ v: "1" });

  if (result.feed) {
    if (result.feed[0]) {
      const id = result.feed[0].id
    }
  }
}`;
        const output = await validate(result, config, docs, schema, usage);

        expect(output).toMatchSnapshot();
      },
    );

    compatibleIt('extensionType should be irrelevant when rawRequest is false', async () => {
      const config = { rawRequest: false, extensionsType: 'unknown' };
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
async function test() {
  const Client = require('graphql-request').GraphQLClient;
  const client = new Client('');
  const sdk = getSdk(client);

  await sdk.feed();
  await sdk.feed3();
  await sdk.feed4();

  const result = await sdk.feed2({ v: "1" });

  if (result.feed) {
    if (result.feed[0]) {
      const id = result.feed[0].id
    }
  }
}`;
      const output = await validate(result, config, docs, schema, usage);

      expect(output).toMatchSnapshot();
    });
  });

  describe('issues', () => {
    it('#5386 - should provide a nice error when dealing with anonymous operations', async () => {
      const doc = parse(/* GraphQL */ `
        query {
          feed {
            id
          }
        }
      `);

      const warnSpy = jest.spyOn(console, 'warn');
      const docs = [{ location: 'file.graphlq', document: doc }];
      const result = (await plugin(schema, docs, {}, {})) as Types.ComplexPluginOutput;
      expect(result.content).not.toContain('feed');
      expect(warnSpy.mock.calls.length).toBe(1);
      expect(warnSpy.mock.calls[0][0]).toContain('Anonymous GraphQL operation was ignored');
      expect(warnSpy.mock.calls[0][1]).toContain('feed');
      warnSpy.mockRestore();
    });

    compatibleIt('#4748 - integration with importDocumentNodeExternallyFrom', async () => {
      const config = {
        importDocumentNodeExternallyFrom: './operations',
        documentMode: DocumentMode.external,
      };
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;
      const output = await validate(result, config, docs, schema, '');

      expect(output).toContain(`import * as Operations from './operations';`);
      expect(output).toContain(
        `({ document: Operations.FeedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'feed', 'query', variables);`,
      );
      expect(output).toContain(
        `({ document: Operations.Feed2Document, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'feed2', 'query', variables);`,
      );
      expect(output).toContain(
        `({ document: Operations.Feed3Document, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'feed3', 'query', variables);`,
      );
    });

    compatibleIt('#7114 - honor importOperationTypesFrom', async () => {
      const config = { importOperationTypesFrom: 'Types' };
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;
      const output = await validate(result, config, docs, schema, '');

      expect(output).toContain(`Types.FeedQuery`);
      expect(output).toContain(`Types.Feed2Query`);
      expect(output).toContain(`Types.Feed3Query`);
      expect(output).toContain(`Types.Feed4Query`);
    });
  });
});
