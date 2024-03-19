import { buildClientSchema, type GraphQLSchema, parse } from 'graphql';
import { mergeOutputs, type Types } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { plugin as tsPlugin, type TypeScriptPluginConfig } from '@graphql-codegen/typescript';
import {
  plugin as tsDocumentsPlugin,
  type TypeScriptDocumentsPluginConfig,
} from '@graphql-codegen/typescript-operations';
import {
  DocumentMode,
  type RawClientSideBasePluginConfig,
} from '@graphql-codegen/visitor-plugin-common';
import { plugin } from '../src/index.js';

describe('effect', () => {
  const schema = buildClientSchema(require('../../../../../dev-test/githunt/schema.json'));
  const basicDoc = parse(/* GraphQL */ `
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
      RawClientSideBasePluginConfig,
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
    it('Should generate the correct content', async () => {
      const config = {};
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
import { Layer } from 'effect';
import { NodeHttpClient } from '@effect/platform-node';

const HttpClientLive = Layer.effect(
  Http.client.Client,
  Effect.map(
    Http.client.Client,
    Http.client.mapRequest(Http.request.prependUrl('http://localhost:4000/graphql')),
  ),
).pipe(Layer.provide(NodeHttpClient.layer));

const run = <A, E>(e: Effect.Effect<A, E, Http.client.Client.Default>) =>
  e.pipe(Effect.provide(HttpClientLive), Effect.runPromise);

async function test() {
  await run(feed({}));
  await run(feed3({}));
  await run(feed4({}));

  const { body: { data } } = await run(feed2({}));

  if (data.feed) {
    if (data.feed[0]) {
      const id = data.feed[0].id
    }
  }
}
`;

      const output = await validate(result, config, docs, schema, usage);

      expect(result.prepend).toContain("import { Data, Effect } from 'effect';");
      expect(result.prepend).toContain(
        "import { DocumentNode, ExecutionResult, print } from 'graphql';",
      );
      expect(result.prepend).toContain("import * as Http from '@effect/platform/HttpClient';");
      expect(result.prepend).toContain("import * as S from '@effect/schema/Schema';");
      expect(output).toMatchSnapshot();
    });

    it('Should generate the correct content with documentMode=string', async () => {
      const config = { documentMode: DocumentMode.string };
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
import { Layer } from 'effect';
import { NodeHttpClient } from '@effect/platform-node';

const HttpClientLive = Layer.effect(
  Http.client.Client,
  Effect.map(
    Http.client.Client,
    Http.client.mapRequest(Http.request.prependUrl('http://localhost:4000/graphql')),
  ),
).pipe(Layer.provide(NodeHttpClient.layer));

const run = <A, E>(e: Effect.Effect<A, E, Http.client.Client.Default>) =>
  e.pipe(Effect.provide(HttpClientLive), Effect.runPromise);

async function test() {
  await run(feed({}));
  await run(feed3({}));
  await run(feed4({}));

  const { body: { data } } = await run(feed2({}));

  if (data.feed) {
    if (data.feed[0]) {
      const id = data.feed[0].id
    }
  }
}
`;

      const output = await validate(result, config, docs, schema, usage);

      expect(result.prepend).toContain("import { Data, Effect } from 'effect';");
      expect(result.prepend).toContain(
        "import { DocumentNode, ExecutionResult, print } from 'graphql';",
      );
      expect(result.prepend).toContain("import * as Http from '@effect/platform/HttpClient';");
      expect(result.prepend).toContain("import * as S from '@effect/schema/Schema';");
      expect(output).toMatchSnapshot();
    });

    it('Should support useTypeImports', async () => {
      const config = { useTypeImports: true };
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
import { Layer } from 'effect';
import { NodeHttpClient } from '@effect/platform-node';

const HttpClientLive = Layer.effect(
  Http.client.Client,
  Effect.map(
    Http.client.Client,
    Http.client.mapRequest(Http.request.prependUrl('http://localhost:4000/graphql')),
  ),
).pipe(Layer.provide(NodeHttpClient.layer));

const run = <A, E>(e: Effect.Effect<A, E, Http.client.Client.Default>) =>
  e.pipe(Effect.provide(HttpClientLive), Effect.runPromise);

async function test() {
  await run(feed({}));
  await run(feed3({}));
  await run(feed4({}));

  const { body: { data } } = await run(feed2({}));

  if (data.feed) {
    if (data.feed[0]) {
      const id = data.feed[0].id
    }
  }
}
`;

      const output = await validate(result, config, docs, schema, usage);

      expect(result.prepend).toContain("import { Data, Effect } from 'effect';");
      expect(result.prepend).toContain(
        "import { type DocumentNode, type ExecutionResult, print } from 'graphql';",
      );
      expect(result.prepend).toContain("import * as Http from '@effect/platform/HttpClient';");
      expect(result.prepend).toContain("import * as S from '@effect/schema/Schema';");
      expect(output).toMatchSnapshot();
    });

    it('Should log a warning when an operation is anonymous', async () => {
      const doc = parse(/* GraphQL */ `
        query {
          feed {
            id
          }
        }
      `);

      const warnSpy = jest.spyOn(console, 'warn');
      const docs = [{ location: 'file.graphql', document: doc }];
      const result = (await plugin(schema, docs, {}, {})) as Types.ComplexPluginOutput;
      expect(result.content).not.toContain('feed');
      expect(warnSpy.mock.calls.length).toBe(1);
      expect(warnSpy.mock.calls[0][0]).toContain('Anonymous GraphQL operation was ignored');
      expect(warnSpy.mock.calls[0][1]).toContain('feed');
      warnSpy.mockRestore();
    });

    it('Should integrate with importDocumentNodeExternallyFrom', async () => {
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
      expect(output).toContain(`
export const feed = makeGraphQLOperation<FeedQueryVariables, FeedQuery>({
  document: Operations.FeedDocument,
  fallbackOperationName: 'feed',
});`);
      expect(output).toContain(`
export const feed2 = makeGraphQLOperation<Feed2QueryVariables, Feed2Query>({
  document: Operations.Feed2Document,
  fallbackOperationName: 'feed2',
});
`);
      expect(output).toContain(`
export const feed3 = makeGraphQLOperation<Feed3QueryVariables, Feed3Query>({
  document: Operations.Feed3Document,
  fallbackOperationName: 'feed3',
});
`);
      expect(output).toContain(`
export const feed4 = makeGraphQLOperation<Feed4QueryVariables, Feed4Query>({
  document: Operations.Feed4Document,
  fallbackOperationName: 'feed4',
});
`);
    });

    it('Should honor importOperationTypesFrom', async () => {
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
