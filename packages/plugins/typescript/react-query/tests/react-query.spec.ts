import { buildClientSchema, buildSchema, GraphQLSchema, parse } from 'graphql';
import { mergeOutputs, Types } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { plugin as tsPlugin } from '@graphql-codegen/typescript';
import { plugin as tsDocumentsPlugin } from '@graphql-codegen/typescript-operations';
import type { ReactQueryRawPluginConfig } from '../src/config';
import { plugin } from '../src/index.js';

const validateTypeScript = async (
  output: Types.PluginOutput,
  testSchema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: any,
) => {
  const tsOutput = await tsPlugin(testSchema, documents, config, { outputFile: '' });
  const tsDocumentsOutput = await tsDocumentsPlugin(testSchema, documents, config, {
    outputFile: '',
  });
  const merged = mergeOutputs([tsOutput, tsDocumentsOutput, output]);
  validateTs(merged, undefined, true, false);

  return merged;
};

describe('React-Query', () => {
  it('support v4 syntax', async () => {
    const config = {
      useTypeImports: true,
      legacyMode: false,
      addInfiniteQuery: true,
    };

    const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

    expect(out.prepend).toMatchSnapshot('prepend');
    expect(out.content).toMatchSnapshot('content');
    await validateTypeScript(mergeOutputs(out), schema, docs, config);
  });

  it('support v5 syntax', async () => {
    const config: ReactQueryRawPluginConfig = {
      reactQueryVersion: 5,
      addInfiniteQuery: true,
      addSuspenseQuery: true,
    };

    const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

    expect(out.prepend).toMatchSnapshot('prepend');
    expect(out.content).toMatchSnapshot('content');
    await validateTypeScript(mergeOutputs(out), schema, docs, config);
  });

  it('support import-type preset in v4', async () => {
    const config: ReactQueryRawPluginConfig = {
      importOperationTypesFrom: 'Types',
    };

    const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

    expect(out.content).toMatchSnapshot('content');
    await validateTypeScript(mergeOutputs(out), schema, docs, config);
  });

  it('support import-type preset in v5', async () => {
    const config: ReactQueryRawPluginConfig = {
      reactQueryVersion: 5,
      importOperationTypesFrom: 'Types',
    };

    const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

    expect(out.content).toMatchSnapshot('content');
    await validateTypeScript(mergeOutputs(out), schema, docs, config);
  });

  it('Duplicated nested fragments are removed', async () => {
    const schema = buildSchema(/* GraphQL */ `
      schema {
        query: Query
      }

      type Query {
        user(id: ID!): User
      }

      type User {
        id: ID!
        name: String!
      }
    `);

    const ast = parse(/* GraphQL */ `
      query foo {
        user1: user(id: 1) {
          ...userWithEmail
        }
        user2: user(id: 2) {
          ...userWithName
        }
      }

      fragment userBase on User {
        id
      }

      fragment userWithEmail on User {
        ...userBase
        email
      }

      fragment userWithName on User {
        ...userBase
        name
      }
    `);

    const res = (await plugin(
      schema,
      [{ location: '', document: ast }],
      { dedupeFragments: true },
      { outputFile: '' },
    )) as Types.ComplexPluginOutput;

    expect((res.content.match(/\{UserBaseFragmentDoc\}/g) || []).length).toBe(1);
  });

  const schema = buildClientSchema(require('../../../../../dev-test/githunt/schema.json'));
  const basicDoc = parse(/* GraphQL */ `
    query test {
      feed {
        id
        commentCount
        repository {
          full_name
          html_url
          owner {
            avatar_url
          }
        }
      }
    }
  `);
  const basicMutation = parse(/* GraphQL */ `
    mutation test($name: String) {
      submitRepository(repoFullName: $name) {
        id
      }
    }
  `);
  const basicFragment = parse(/* GraphQL */ `
    fragment EntryData on Entry {
      feed {
        id
        commentCount
        repository {
          full_name
          html_url
          owner {
            avatar_url
          }
        }
      }
    }
  `);
  const docs = [
    {
      document: basicDoc,
    },
    {
      document: basicMutation,
    },
  ];
  const notOperationDocs = [
    {
      document: basicFragment,
    },
  ];

  it('should allow to override TError type', async () => {
    const config = {
      errorType: 'any',
    };

    const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;
    expect(out.content).not.toContain(`TError = unknown`);
    expect(out.content).toContain(`TError = any`);
  });

  describe('fetcher: custom-mapper', () => {
    it('Should generate query correctly with external mapper', async () => {
      const config = {
        fetcher: './my-file#myCustomFetcher',
        typesPrefix: 'T',
        addInfiniteQuery: true,
        legacyMode: true,
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toMatchSnapshot('prepend');
      expect(out.content).toMatchSnapshot('content');
      await validateTypeScript(mergeOutputs(out), schema, docs, config);
    });

    it('Should generate query correctly with internal mapper', async () => {
      const config = {
        fetcher: 'myCustomFetcher',
        typesPrefix: 'T',
        legacyMode: true,
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toMatchSnapshot('prepend');
      expect(out.content).toMatchSnapshot('content');
      await validateTypeScript(mergeOutputs(out), schema, docs, config);
    });

    it('Should generate mutation correctly with lazy variables', async () => {
      const config = {
        fetcher: {
          func: './my-file#useCustomFetcher',
          isReactHook: true,
        },
        typesPrefix: 'T',
        addInfiniteQuery: true,
        legacyMode: true,
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toMatchSnapshot('prepend');
      expect(out.content).toMatchSnapshot('content');
      await validateTypeScript(mergeOutputs(out), schema, docs, config);
    });

    it('Should support useTypeImports', async () => {
      const config = {
        fetcher: {
          func: './my-file#customFetcher',
        },
        useTypeImports: true,
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toContain(`import type { customFetcher } from './my-file';`);
    });

    it("Should generate fetcher field when exposeFetcher is true and the fetcher isn't a react hook", async () => {
      const config = {
        fetcher: {
          func: './my-file#customFetcher',
        },
        exposeFetcher: true,
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;
      expect(out.content).toBeSimilarStringTo(
        `useTestQuery.fetcher = (variables?: TestQueryVariables, options?: RequestInit['headers']) => customFetcher<TestQuery, TestQueryVariables>(TestDocument, variables, options);`,
      );
    });

    it('Should NOT generate fetcher field when exposeFetcher is true and the fetcher IS a react hook', async () => {
      const config = {
        fetcher: {
          func: './my-file#useCustomFetcher',
          isReactHook: true,
        },
        exposeFetcher: true,
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;
      expect(out.content).not.toBeSimilarStringTo(`useTestQuery.fetcher`);
    });

    it("Should generate mutation fetcher field when exposeFetcher is true and the fetcher isn't a react hook", async () => {
      const config = {
        fetcher: {
          func: './my-file#customFetcher',
        },
        exposeFetcher: true,
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;
      expect(out.content).toBeSimilarStringTo(
        `useTestMutation.fetcher = (variables?: TestMutationVariables, options?: RequestInit['headers']) => customFetcher<TestMutation, TestMutationVariables>(TestDocument, variables, options);`,
      );
    });

    it('Should NOT generate mutation fetcher field when exposeFetcher is true and the fetcher IS a react hook', async () => {
      const config = {
        fetcher: {
          func: './my-file#useCustomFetcher',
          isReactHook: true,
        },
        exposeFetcher: true,
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;
      expect(out.content).not.toBeSimilarStringTo(`useTestMutation.fetcher`);
    });

    describe('exposeMutationKeys: true', () => {
      it('Should generate getKey for each mutation', async () => {
        const config = {
          fetcher: 'fetch',
          exposeMutationKeys: true,
        };
        const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;
        expect(out.content).toBeSimilarStringTo(`useTestMutation.getKey = () => ['test']\n`);
      });
    });

    it(`tests for dedupeOperationSuffix`, async () => {
      const ast = parse(/* GraphQL */ `
        query notificationsQuery {
          notifications {
            id
          }
        }
      `);
      const ast2 = parse(/* GraphQL */ `
        query notifications {
          notifications {
            id
          }
        }
      `);
      const config = {
        fetcher: 'myCustomFetcher',
        typesPrefix: 'T',
        outputFile: '',
      };

      expect(
        ((await plugin(schema, [{ location: 'test-file.ts', document: ast }], {}, config)) as any)
          .content,
      ).toContain('fetcher<NotificationsQueryQuery, NotificationsQueryQueryVariables>');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast }],
            { dedupeOperationSuffix: false },
            config,
          )) as any
        ).content,
      ).toContain('fetcher<NotificationsQueryQuery, NotificationsQueryQueryVariables>');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast }],
            { dedupeOperationSuffix: false },
            config,
          )) as any
        ).content,
      ).toContain('export const useNotificationsQueryQuery = ');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast }],
            { dedupeOperationSuffix: true },
            config,
          )) as any
        ).content,
      ).toContain('fetcher<NotificationsQuery, NotificationsQueryVariables>');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast }],
            { dedupeOperationSuffix: true },
            config,
          )) as any
        ).content,
      ).toContain('export const useNotificationsQuery =');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast2 }],
            { dedupeOperationSuffix: true },
            config,
          )) as any
        ).content,
      ).toContain('fetcher<NotificationsQuery, NotificationsQueryVariables>');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast2 }],
            { dedupeOperationSuffix: true },
            config,
          )) as any
        ).content,
      ).toContain('export const useNotificationsQuery =');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast2 }],
            { dedupeOperationSuffix: false },
            config,
          )) as any
        ).content,
      ).toContain('fetcher<NotificationsQuery, NotificationsQueryVariables>');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast2 }],
            { dedupeOperationSuffix: false },
            config,
          )) as any
        ).content,
      ).toContain('export const useNotificationsQuery =');
    });
  });

  describe('fetcher: graphql-request', () => {
    it('Should generate query correctly with client', async () => {
      const config = {
        fetcher: 'graphql-request',
        typesPrefix: 'T',
        addInfiniteQuery: true,
        legacyMode: true,
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toMatchSnapshot('prepend');
      expect(out.content).toMatchSnapshot('content');
      await validateTypeScript(mergeOutputs(out), schema, docs, config);
    });
    it('Should support useTypeImports', async () => {
      const config = {
        fetcher: 'graphql-request',
        useTypeImports: true,
        legacyMode: true,
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toContain(`import type { GraphQLClient } from 'graphql-request';`);
      expect(out.prepend).toContain(
        `import { useQuery, useMutation, type UseQueryOptions, type UseMutationOptions } from 'react-query';`,
      );
    });
    it('Should generate fetcher field when exposeFetcher is true', async () => {
      const config = {
        fetcher: 'graphql-request',
        exposeFetcher: true,
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;
      expect(out.content).toBeSimilarStringTo(
        `useTestQuery.fetcher = (client: GraphQLClient, variables?: TestQueryVariables, headers?: RequestInit['headers']) => fetcher<TestQuery, TestQueryVariables>(client, TestDocument, variables, headers);`,
      );
    });
    it(`tests for dedupeOperationSuffix`, async () => {
      const ast = parse(/* GraphQL */ `
        query notificationsQuery {
          notifications {
            id
          }
        }
      `);
      const ast2 = parse(/* GraphQL */ `
        query notifications {
          notifications {
            id
          }
        }
      `);
      const config = {
        fetcher: 'graphql-request',
        typesPrefix: 'T',
      };

      expect(
        ((await plugin(schema, [{ location: 'test-file.ts', document: ast }], {}, config)) as any)
          .content,
      ).toContain('fetcher<NotificationsQueryQuery, NotificationsQueryQueryVariables>');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast }],
            { dedupeOperationSuffix: false },
            config,
          )) as any
        ).content,
      ).toContain('fetcher<NotificationsQueryQuery, NotificationsQueryQueryVariables>');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast }],
            { dedupeOperationSuffix: false },
            config,
          )) as any
        ).content,
      ).toContain('export const useNotificationsQueryQuery = ');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast }],
            { dedupeOperationSuffix: true },
            config,
          )) as any
        ).content,
      ).toContain('fetcher<NotificationsQuery, NotificationsQueryVariables>');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast }],
            { dedupeOperationSuffix: true },
            config,
          )) as any
        ).content,
      ).toContain('export const useNotificationsQuery =');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast2 }],
            { dedupeOperationSuffix: true },
            config,
          )) as any
        ).content,
      ).toContain('fetcher<NotificationsQuery, NotificationsQueryVariables>');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast2 }],
            { dedupeOperationSuffix: true },
            config,
          )) as any
        ).content,
      ).toContain('export const useNotificationsQuery =');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast2 }],
            { dedupeOperationSuffix: false },
            config,
          )) as any
        ).content,
      ).toContain('fetcher<NotificationsQuery, NotificationsQueryVariables>');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast2 }],
            { dedupeOperationSuffix: false },
            config,
          )) as any
        ).content,
      ).toContain('export const useNotificationsQuery =');
    });
  });

  describe('fetcher: graphql-request with clientImportPath', () => {
    const clientImportPath = "import { client as graphqlClient } from 'client.ts';";

    it('Should generate query correctly with client', async () => {
      const config = {
        fetcher: {
          clientImportPath,
        },
        typesPrefix: 'T',
        legacyMode: true,
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toMatchSnapshot('prepend');
      expect(out.content).toMatchSnapshot('content');
      await validateTypeScript(mergeOutputs(out), schema, docs, config);
    });
    it('Should generate fetcher field when exposeFetcher is true', async () => {
      const config = {
        fetcher: {
          clientImportPath,
        },
        exposeFetcher: true,
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;
      expect(out.content).toBeSimilarStringTo(
        `useTestQuery.fetcher = (variables?: TestQueryVariables, headers?: RequestInit['headers']) => fetcher<TestQuery, TestQueryVariables>(TestDocument, variables, headers);`,
      );
    });
  });

  describe('fetcher: hardcoded-fetch', () => {
    it('Should generate query correctly with hardcoded endpoint', async () => {
      const config = {
        fetcher: {
          endpoint: 'http://localhost:3000/graphql',
        },
        typesPrefix: 'T',
        legacyMode: true,
        addInfiniteQuery: true,
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toMatchSnapshot('prepend');
      expect(out.content).toMatchSnapshot('content');
      await validateTypeScript(mergeOutputs(out), schema, docs, config);
    });

    it('Should generate query correctly with fetch config', async () => {
      const config = {
        fetcher: {
          endpoint: 'http://localhost:3000/graphql',
          fetchParams: JSON.stringify({
            headers: {
              Authorization: 'Bearer XYZ',
            },
          }),
        },
        typesPrefix: 'T',
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toMatchSnapshot('prepend');
      expect(out.content).toMatchSnapshot('content');
      await validateTypeScript(mergeOutputs(out), schema, docs, config);
    });

    it('Should generate query correctly with fetch config and fetchParams object', async () => {
      const config = {
        fetcher: {
          endpoint: 'http://localhost:3000/graphql',
          fetchParams: {
            headers: {
              Authorization: 'Bearer XYZ',
            },
          },
        },
        typesPrefix: 'T',
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toMatchSnapshot('prepend');
      expect(out.content).toMatchSnapshot('content');
      await validateTypeScript(mergeOutputs(out), schema, docs, config);
    });

    it('Should generate query correctly with hardcoded endpoint from env var', async () => {
      const config = {
        fetcher: {
          endpoint: 'process.env.ENDPOINT_URL',
        },
        typesPrefix: 'T',
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toMatchSnapshot('prepend');
      expect(out.content).toMatchSnapshot('content');
      await validateTypeScript(mergeOutputs(out), schema, docs, config);
    });

    it('Should generate query correctly with hardcoded endpoint from just identifier', async () => {
      const config = {
        fetcher: {
          endpoint: 'myEndpoint',
        },
        typesPrefix: 'T',
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toMatchSnapshot('prepend');
      expect(out.content).toMatchSnapshot('content');
      await validateTypeScript(mergeOutputs(out), schema, docs, config);
    });

    it('Should generate fetcher field when exposeFetcher is true', async () => {
      const config = {
        fetcher: {
          endpoint: 'myEndpoint',
        },
        exposeFetcher: true,
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;
      expect(out.content).toBeSimilarStringTo(
        `useTestQuery.fetcher = (variables?: TestQueryVariables) => fetcher<TestQuery, TestQueryVariables>(TestDocument, variables);`,
      );
    });

    it(`tests for dedupeOperationSuffix`, async () => {
      const ast = parse(/* GraphQL */ `
        query notificationsQuery {
          notifications {
            id
          }
        }
      `);
      const ast2 = parse(/* GraphQL */ `
        query notifications {
          notifications {
            id
          }
        }
      `);
      const config = {
        fetcher: {
          endpoint: 'http://localhost:3000/graphql',
        },
        typesPrefix: 'T',
      };

      expect(
        ((await plugin(schema, [{ location: 'test-file.ts', document: ast }], {}, config)) as any)
          .content,
      ).toContain('fetcher<NotificationsQueryQuery, NotificationsQueryQueryVariables>');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast }],
            { dedupeOperationSuffix: false },
            config,
          )) as any
        ).content,
      ).toContain('fetcher<NotificationsQueryQuery, NotificationsQueryQueryVariables>');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast }],
            { dedupeOperationSuffix: false },
            config,
          )) as any
        ).content,
      ).toContain('export const useNotificationsQueryQuery = ');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast }],
            { dedupeOperationSuffix: true },
            config,
          )) as any
        ).content,
      ).toContain('fetcher<NotificationsQuery, NotificationsQueryVariables>');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast }],
            { dedupeOperationSuffix: true },
            config,
          )) as any
        ).content,
      ).toContain('export const useNotificationsQuery =');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast2 }],
            { dedupeOperationSuffix: true },
            config,
          )) as any
        ).content,
      ).toContain('fetcher<NotificationsQuery, NotificationsQueryVariables>');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast2 }],
            { dedupeOperationSuffix: true },
            config,
          )) as any
        ).content,
      ).toContain('export const useNotificationsQuery =');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast2 }],
            { dedupeOperationSuffix: false },
            config,
          )) as any
        ).content,
      ).toContain('fetcher<NotificationsQuery, NotificationsQueryVariables>');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast2 }],
            { dedupeOperationSuffix: false },
            config,
          )) as any
        ).content,
      ).toContain('export const useNotificationsQuery =');
    });
  });

  describe('fetcher: fetch', () => {
    it('Should generate query and mutation correctly', async () => {
      const config = {
        fetcher: 'fetch',
        typesPrefix: 'T',
        legacyMode: true,
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toMatchSnapshot('prepend');
      expect(out.content).toMatchSnapshot('content');
      await validateTypeScript(mergeOutputs(out), schema, docs, config);
    });

    it('Should generate fetcher field when exposeFetcher is true', async () => {
      const config = {
        exposeFetcher: true,
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;
      expect(out.content).toBeSimilarStringTo(
        `useTestQuery.fetcher = (dataSource: { endpoint: string, fetchParams?: RequestInit }, variables?: TestQueryVariables) => fetcher<TestQuery, TestQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, TestDocument, variables);`,
      );
    });

    it(`tests for dedupeOperationSuffix`, async () => {
      const ast = parse(/* GraphQL */ `
        query notificationsQuery {
          notifications {
            id
          }
        }
      `);
      const ast2 = parse(/* GraphQL */ `
        query notifications {
          notifications {
            id
          }
        }
      `);
      const config = {
        fetcher: 'fetch',
        typesPrefix: 'T',
      };

      expect(
        ((await plugin(schema, [{ location: 'test-file.ts', document: ast }], {}, config)) as any)
          .content,
      ).toContain('fetcher<NotificationsQueryQuery, NotificationsQueryQueryVariables>');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast }],
            { dedupeOperationSuffix: false },
            config,
          )) as any
        ).content,
      ).toContain('fetcher<NotificationsQueryQuery, NotificationsQueryQueryVariables>');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast }],
            { dedupeOperationSuffix: false },
            config,
          )) as any
        ).content,
      ).toContain('export const useNotificationsQueryQuery = ');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast }],
            { dedupeOperationSuffix: true },
            config,
          )) as any
        ).content,
      ).toContain('fetcher<NotificationsQuery, NotificationsQueryVariables>');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast }],
            { dedupeOperationSuffix: true },
            config,
          )) as any
        ).content,
      ).toContain('export const useNotificationsQuery =');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast2 }],
            { dedupeOperationSuffix: true },
            config,
          )) as any
        ).content,
      ).toContain('fetcher<NotificationsQuery, NotificationsQueryVariables>');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast2 }],
            { dedupeOperationSuffix: true },
            config,
          )) as any
        ).content,
      ).toContain('export const useNotificationsQuery =');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast2 }],
            { dedupeOperationSuffix: false },
            config,
          )) as any
        ).content,
      ).toContain('fetcher<NotificationsQuery, NotificationsQueryVariables>');
      expect(
        (
          (await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast2 }],
            { dedupeOperationSuffix: false },
            config,
          )) as any
        ).content,
      ).toContain('export const useNotificationsQuery =');
    });
  });

  describe('exposeDocument: true', () => {
    it('Should generate document field for each query', async () => {
      const config = {
        fetcher: 'fetch',
        exposeDocument: true,
      };
      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;
      expect(out.content).toBeSimilarStringTo(`useTestQuery.document = TestDocument;`);
    });
  });

  describe('exposeQueryKeys: true', () => {
    it('Should generate getKey for each query', async () => {
      const config = {
        fetcher: 'fetch',
        exposeQueryKeys: true,
      };
      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;
      expect(out.content).toMatchSnapshot();
      expect(out.content).toBeSimilarStringTo(
        `useTestQuery.getKey = (variables?: TestQueryVariables) => variables === undefined ? ['test', {}] : ['test', variables];`,
      );
    });
  });

  describe('exposeQueryKeys: true, addInfiniteQuery: true', () => {
    it('Should generate getKey for each query - also infinite queries', async () => {
      const config = {
        fetcher: 'fetch',
        exposeQueryKeys: true,
        addInfiniteQuery: true,
      };
      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;
      expect(out.content).toMatchSnapshot();
      expect(out.content).toBeSimilarStringTo(
        `useTestQuery.getKey = (variables?: TestQueryVariables) => variables === undefined ? ['test', {}] : ['test', variables];`,
      );
      expect(out.content).toBeSimilarStringTo(
        `useInfiniteTestQuery.getKey = (variables?: TestQueryVariables) => variables === undefined ? ['test.infinite', {}] : ['test.infinite', variables];`,
      );
    });
  });

  describe('exposeQueryRootKeys: true', () => {
    it('Should generate rootKey for each query', async () => {
      const config = {
        fetcher: 'fetch',
        exposeQueryRootKeys: true,
      };
      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;
      expect(out.content).toMatchSnapshot();
      expect(out.content).toBeSimilarStringTo(`useTestQuery.rootKey = 'test';`);
    });
  });

  describe('exposeQueryRootKeys: true, addInfiniteQuery: true', () => {
    it('Should generate rootKey for each query - also infinite queries', async () => {
      const config = {
        fetcher: 'fetch',
        exposeQueryRootKeys: true,
        addInfiniteQuery: true,
      };
      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;
      expect(out.content).toMatchSnapshot();
      expect(out.content).toBeSimilarStringTo(`useTestQuery.rootKey = 'test';`);
      expect(out.content).toBeSimilarStringTo(`useInfiniteTestQuery.rootKey = 'test.infinite';`);
    });
  });

  it('Should not generate fetcher if there are no operations', async () => {
    const out = (await plugin(schema, notOperationDocs, {})) as Types.ComplexPluginOutput;
    expect(out.prepend).not.toBeSimilarStringTo(`function fetcher<TData, TVariables>(`);

    const config = {
      fetcher: 'graphql-request',
    };

    const outGraphqlRequest = (await plugin(
      schema,
      notOperationDocs,
      config,
    )) as Types.ComplexPluginOutput;
    expect(outGraphqlRequest.prepend).not.toContain(
      `import { GraphQLClient } from 'graphql-request';`,
    );
  });

  it('Parses process.env variables correctly', async () => {
    const outGraphqlRequest = (await plugin(schema, docs, {
      fetcher: {
        endpoint: 'process.env.ENDPOINT',
        fetchParams: `
          {
            headers: {
              apiKey: process.env.APIKEY as string,
              somethingElse: process.env.SOMETHING as string
            },
          }`,
      },
    })) as Types.ComplexPluginOutput;

    expect(outGraphqlRequest.prepend).toBeSimilarStringTo(`
    const res = await fetch(process.env.ENDPOINT as string, {
      method: "POST", ...(
                {
                  headers: {
                    apiKey: process.env.APIKEY as string,
                    somethingElse: process.env.SOMETHING as string
                  },
                }),
            body: JSON.stringify({ query, variables }),
          });
    `);
  });

  describe('reactQueryImportFrom: custom-path', () => {
    it('Should import react-query from custom path', async () => {
      const config = {
        legacyMode: true,
        reactQueryImportFrom: 'custom-react-query',
      };
      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;
      expect(out.prepend).toMatchSnapshot('prepend');
      await validateTypeScript(mergeOutputs(out), schema, docs, config);
    });
  });
});
