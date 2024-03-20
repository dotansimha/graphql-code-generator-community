import * as path from 'node:path';
import * as fs from 'fs-extra';
import { parse } from 'graphql';
import { codegen } from '@graphql-codegen/core';
import { mockGraphQLServer } from '@graphql-codegen/testing';
import * as TypeScriptPlugin from '@graphql-codegen/typescript';
import * as TypeScriptOperationsPlugin from '@graphql-codegen/typescript-operations';
import { makeExecutableSchema } from '@graphql-tools/schema';
import * as EffectPlugin from '../src/index.js';

const clientFileName = 'effect-client.ts';
const clientFilePath = path.join(__dirname, './test-files', clientFileName);
const sdkFileName = 'effect-sdk.ts';
const sdkFilePath = path.join(__dirname, './test-files', sdkFileName);
const typeDefs = parse(/* GraphQL */ `
  type Query {
    add(x: Int!, y: Int!): Int!
  }
`);
const schema = makeExecutableSchema({
  typeDefs,
  resolvers: {
    Query: {
      add: (_, { x, y }) => x + y,
    },
  },
});
const exampleQuery = /* GraphQL */ `
  query Add($x: Int!, $y: Int!) {
    add(x: $x, y: $y)
  }
`;
const baseCodegenConfig = {
  schema: typeDefs,
  schemaAst: schema,
  documents: [
    {
      document: parse(exampleQuery),
      rawSDL: exampleQuery,
    },
  ],
  filename: 'dummy-filename',
  pluginMap: {
    typescript: TypeScriptPlugin,
    'typescript-operations': TypeScriptOperationsPlugin,
    effect: EffectPlugin,
  },
  config: {},
};

const testAdd = async (testFilePath: string) => {
  const server = mockGraphQLServer({
    schema,
    host: 'http://localhost:4000',
    path: '/graphql',
  });
  const { exampleQueries } = require(testFilePath);
  const { add } = exampleQueries('http://localhost:4000/graphql');
  const { body } = await add(2, 3);
  expect(body.data.add).toBe(5);
  server.done();
};

describe('Effect Integration', () => {
  describe('with "mixed" mode configuration', () => {
    it('should send requests correctly', async () => {
      const sdkCodeString = await codegen({
        ...baseCodegenConfig,
        plugins: [
          { typescript: {} },
          { 'typescript-operations': {} },
          { effect: { mode: 'mixed' } },
        ],
      });
      await fs.writeFile(sdkFilePath, sdkCodeString, 'utf-8');
      await testAdd('./test-files/run-example-query-mixed');
      await fs.remove(sdkFilePath);
    });
  });

  describe('with "split" mode configuration', () => {
    it('should send requests correctly', async () => {
      const clientCodeString = await codegen({
        ...baseCodegenConfig,
        plugins: [{ effect: { mode: 'client-only' } }],
      });
      await fs.writeFile(clientFilePath, clientCodeString, 'utf-8');
      const sdkCodeString = await codegen({
        ...baseCodegenConfig,
        plugins: [
          { typescript: {} },
          { 'typescript-operations': {} },
          {
            effect: {
              mode: 'operations-only',
              relativeClientImportPath: './effect-client.js',
            },
          },
        ],
      });
      await fs.writeFile(sdkFilePath, sdkCodeString, 'utf-8');
      await testAdd('./test-files/run-example-query-split');
      await fs.remove(clientFilePath);
      await fs.remove(sdkFilePath);
    });
  });
});
