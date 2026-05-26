import { buildClientSchema, GraphQLSchema, parse } from 'graphql';
import { mergeOutputs, Types } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { plugin as tsPlugin, TypeScriptPluginConfig } from '@graphql-codegen/typescript';
import {
  plugin as tsDocumentsPlugin,
  TypeScriptDocumentsPluginConfig,
} from '@graphql-codegen/typescript-operations';
import { DocumentMode } from '@graphql-codegen/visitor-plugin-common';
import { RawGraphQLSeperateExportPluginConfig } from '../src/config';
import { plugin } from '../src/index';

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

const unnamedDoc = parse(/* GraphQL */ `
  {
    feed {
      id
    }
  }
`);

const validate = async (
  content: Types.PluginOutput,
  config: TypeScriptPluginConfig &
    TypeScriptDocumentsPluginConfig &
    RawGraphQLSeperateExportPluginConfig,
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

const importGraphQLClientStatment = 'import { client } from "./my-graphql-request"';

describe('graphql-request-seperate-export', () => {
  describe('generate split request function', () => {
    it('Should generate a correct wrap method', async () => {
      const config = {
        importGraphQLClientStatment,
        pureMagicComment: true,
      };
      const docs = [{ filePath: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
async function test() {
  await feed();
  await feed3();
  await feed4();

  const result = await feed2({ v: "1" });

  if (result.feed) {
    if (result.feed[0]) {
      const id = result.feed[0].id
    }
  }
}`;
      const output = await validate(result, config, docs, schema, usage);

      expect(output).toMatchSnapshot();
    });

    it('Should generate a correct wrap method with documentMode=string', async () => {
      const config = {
        importGraphQLClientStatment,
        documentMode: DocumentMode.string,
      };
      const docs = [{ filePath: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
async function test() {
  await feed();
  await feed3();
  await feed4();

  const result = await feed2({ v: "1" });

  if (result.feed) {
    if (result.feed[0]) {
      const id = result.feed[0].id
    }
  }
}`;
      const output = await validate(result, config, docs, schema, usage);

      expect(output).toMatchSnapshot();
    });

    it('Should support rawRequest', async () => {
      const config = {
        importGraphQLClientStatment,
        rawRequest: true,
      };
      const docs = [{ filePath: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
        async function rawRequestTest() {
          await feed();
          await feed3();
          await feed4();

          const result = await feed2({ v: "1" });

          if (result.data.feed) {
            if (result.data.feed[0]) {
              const id = result.data.feed[0].id
            }
          }
        }
      `;
      const output = await validate(result, config, docs, schema, usage);

      expect(output).toMatchSnapshot();
    });

    it('Should throw if it encounters unnamed operations', async () => {
      const config = {
        importGraphQLClientStatment,
      };
      const docs = [{ filePath: '', document: unnamedDoc }];
      try {
        await plugin(schema, docs, config, { outputFile: 'graphql.ts' });
        fail('Should throw');
      } catch (err: unknown) {
        expect(err).toMatchInlineSnapshot(`
          [Error: Plugin 'graphql-request-seperate-export' cannot generate request functions for unnamed operation.

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
