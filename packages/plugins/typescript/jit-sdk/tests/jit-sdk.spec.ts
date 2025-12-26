import {
  buildClientSchema,
  GraphQLSchema,
  versionInfo as graphqlVersion,
  parse,
  printSchema,
} from 'graphql';
import { mergeOutputs, Types } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { plugin as tsPlugin, TypeScriptPluginConfig } from '@graphql-codegen/typescript';
import {
  plugin as tsDocumentsPlugin,
  TypeScriptDocumentsPluginConfig,
} from '@graphql-codegen/typescript-operations';
import { DocumentMode } from '@graphql-codegen/visitor-plugin-common';
import { RawJitSdkPluginConfig } from '../src/config.js';
import { plugin } from '../src/index.js';

// graphql did not add support for operation descriptions until version 16.12.0
// https://github.com/graphql/graphql-js/commit/364f17fd3519fe2daf7caa0238f4f977bd079012
const graphqlQueryDescriptions =
  graphqlVersion.major > 16 || (graphqlVersion.major === 16 && graphqlVersion.minor >= 12);

const schema = buildClientSchema(require('../../../../../dev-test/githunt/schema.json'));
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

const docWithSubscription = parse(/* GraphQL */ `
  query feed {
    feed {
      id
    }
  }

  subscription commentAdded {
    commentAdded {
      id
    }
  }
`);

const unnamedDoc = parse(/* GraphQL */ `
  {
    feed {
      id
    }
  }
`);

const validate = async (
  content: Types.PluginOutput,
  config: TypeScriptPluginConfig & TypeScriptDocumentsPluginConfig & RawJitSdkPluginConfig,
  docs: Types.DocumentFile[],
  pluginSchema: GraphQLSchema,
  usage: string,
) => {
  const m = mergeOutputs([
    await tsPlugin(pluginSchema, docs, config, { outputFile: '' }),
    await tsDocumentsPlugin(pluginSchema, docs, config, { outputFile: '' }),
    content,
    usage,
  ]);

  validateTs(m, {
    allowSyntheticDefaultImports: true,
  });

  return m;
};

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

describe('jit-sdk', () => {
  describe('sdk', () => {
    compatibleIt('Should generate a correct wrap method', async () => {
      const config = {};
      const docs = [{ filePath: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
async function test() {
  const schema = buildSchema(\`${printSchema(schema).trim()}\`);
  const sdk = getJitSdk(schema);

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

    compatibleIt('Should generate a correct wrap method with documentMode=string', async () => {
      const config = { documentMode: DocumentMode.string };
      const docs = [{ filePath: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
async function test() {
  const schema = buildSchema(\`${printSchema(schema).trim()}\`);
  const sdk = getJitSdk(schema);

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

    it('Should generate a correct wrap method in case of Subscription', async () => {
      const docs = [{ filePath: '', document: docWithSubscription }];
      const result = (await plugin(
        schema,
        docs,
        {},
        { outputFile: 'graphql.ts' },
      )) as Types.ComplexPluginOutput;

      const output = await validate(result, {}, docs, schema, '');
      expect(output).toMatchSnapshot();
    });

    it('Should throw if it encounters unnamed operations', async () => {
      const docs = [{ filePath: '', document: unnamedDoc }];
      try {
        await plugin(schema, docs, {}, { outputFile: 'graphql.ts' });
        fail('Should throw');
      } catch (err: unknown) {
        expect(err).toMatchInlineSnapshot(`
[Error: Plugin 'Jit-sdk' cannot generate SDK for unnamed operation.

{
  feed {
    id
  }
}]
`);
      }
    });
  });
});
