import { buildClientSchema, parse } from 'graphql';
import { mergeOutputs, Types } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { plugin as tsPlugin } from '@graphql-codegen/typescript';
import { plugin as tsDocumentsPlugin } from '@graphql-codegen/typescript-operations';
import { plugin } from '../src/index.js';

describe('typescript-solid-urql', () => {
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

  const validateTypeScript = async (
    output: Types.PluginOutput,
    testSchema: typeof schema,
    documents: Types.DocumentFile[],
    config: any,
  ) => {
    const tsOutput = await tsPlugin(testSchema, documents, config, { outputFile: '' });
    const tsDocumentsOutput = await tsDocumentsPlugin(testSchema, documents, config, {
      outputFile: '',
    });
    const merged = mergeOutputs([tsOutput, tsDocumentsOutput, output]);
    validateTs(merged, undefined, true);
  };

  describe('Imports', () => {
    it('should import solid-urql dependencies when primitives are enabled', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          withPrimitives: true,
        },
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(
        `import { createQuery, createMutation, type CreateQueryArgs, type CreateMutationState } from 'solid-urql';`,
      );
      expect(content.prepend).toContain(`import type { Accessor } from 'solid-js';`);
      expect(content.prepend).toContain(
        `import type { OperationContext, OperationResult } from '@urql/core';`,
      );
      await validateTypeScript(content, schema, docs, {});
    });

    it('should use custom urqlImportFrom option', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          withPrimitives: true,
          urqlImportFrom: '@urql/solid',
        },
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(
        `import { createQuery, createMutation, type CreateQueryArgs, type CreateMutationState } from '@urql/solid';`,
      );
      await validateTypeScript(content, schema, docs, {});
    });

    it('should not import solid-urql when withPrimitives is false', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          withPrimitives: false,
        },
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      const imports = content.prepend?.join('\n') || '';
      expect(imports).not.toContain('createQuery');
      expect(imports).not.toContain('createMutation');
    });
  });

  describe('Query Hooks', () => {
    it('should generate query hook with required variables', async () => {
      const docs = [
        {
          location: '',
          document: parse(/* GraphQL */ `
            query GetUser($id: ID!) {
              entry(repoFullName: $id) {
                id
                repository {
                  full_name
                }
              }
            }
          `),
        },
      ];

      const content = (await plugin(
        schema,
        docs,
        { withPrimitives: true },
        { outputFile: 'graphql.ts' },
      )) as Types.ComplexPluginOutput;

      expect(content.content).toContain('export const useCreateGetUser');
      expect(content.content).toContain(
        "args: Omit<CreateQueryArgs<GetUserQueryVariables, GetUserQuery>, 'query'>",
      );
      expect(content.content).toContain('createQuery<GetUserQuery, GetUserQueryVariables>');
      expect(content.content).toContain('query: GetUserDocument');
      await validateTypeScript(content, schema, docs, {});
    });

    it('should generate query hook with optional variables', async () => {
      const docs = [
        {
          location: '',
          document: parse(/* GraphQL */ `
            query GetFeed {
              feed {
                id
                repository {
                  full_name
                }
              }
            }
          `),
        },
      ];

      const content = (await plugin(
        schema,
        docs,
        { withPrimitives: true },
        { outputFile: 'graphql.ts' },
      )) as Types.ComplexPluginOutput;

      expect(content.content).toContain('export const useCreateGetFeed');
      expect(content.content).toContain(
        "args: Omit<CreateQueryArgs<GetFeedQueryVariables, GetFeedQuery>, 'query'> = {}",
      );
      await validateTypeScript(content, schema, docs, {});
    });

    it('should not generate hooks when withPrimitives is false', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { withPrimitives: false },
        { outputFile: 'graphql.ts' },
      )) as Types.ComplexPluginOutput;

      expect(content.content).not.toContain('useCreate');
      expect(content.content).not.toContain('createQuery');
    });
  });

  describe('Mutation Hooks', () => {
    it('should generate mutation hook', async () => {
      const docs = [
        {
          location: '',
          document: parse(/* GraphQL */ `
            mutation SubmitComment($repoFullName: String!, $commentContent: String!) {
              submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
                id
                content
              }
            }
          `),
        },
      ];

      const content = (await plugin(
        schema,
        docs,
        { withPrimitives: true },
        { outputFile: 'graphql.ts' },
      )) as Types.ComplexPluginOutput;

      expect(content.content).toContain('export const useCreateSubmitComment');
      expect(content.content).toContain(
        'createMutation<SubmitCommentMutation, SubmitCommentMutationVariables>',
      );
      expect(content.content).toContain('SubmitCommentDocument');
      await validateTypeScript(content, schema, docs, {});
    });
  });

  describe('Subscription Hooks', () => {
    it('should generate subscription hook with required variables', async () => {
      const docs = [
        {
          location: '',
          document: parse(/* GraphQL */ `
            subscription OnCommentAdded($repoFullName: String!) {
              commentAdded(repoFullName: $repoFullName) {
                id
                content
              }
            }
          `),
        },
      ];

      const content = (await plugin(
        schema,
        docs,
        { withPrimitives: true },
        { outputFile: 'graphql.ts' },
      )) as Types.ComplexPluginOutput;

      expect(content.content).toContain('export const useCreateOnCommentAdded');
      expect(content.content).toContain(
        "args: Omit<CreateQueryArgs<OnCommentAddedSubscriptionVariables, OnCommentAddedSubscription>, 'query'>",
      );
      expect(content.content).toContain(
        'createSubscription<OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables>',
      );
      await validateTypeScript(content, schema, docs, {});
    });
  });

  describe('Configuration', () => {
    it('should default withPrimitives to true', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {},
        { outputFile: 'graphql.ts' },
      )) as Types.ComplexPluginOutput;

      expect(content.content).toContain('useCreate');
    });

    it('should default urqlImportFrom to solid-urql', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { withPrimitives: true },
        { outputFile: 'graphql.ts' },
      )) as Types.ComplexPluginOutput;

      const imports = content.prepend?.join('\n') || '';
      expect(imports).toContain("from 'solid-urql'");
    });
  });

  describe('Validation', () => {
    it('should validate file extension is .ts or .tsx', async () => {
      const { validate } = await import('../src/index.js');

      await expect(validate(schema, [], {}, 'test.js', [])).rejects.toThrow(
        'requires extension to be ".ts" or ".tsx"',
      );
    });

    it('should allow .ts extension', async () => {
      const { validate } = await import('../src/index.js');

      await expect(validate(schema, [], {}, 'test.ts', [])).resolves.not.toThrow();
    });

    it('should allow .tsx extension', async () => {
      const { validate } = await import('../src/index.js');

      await expect(validate(schema, [], {}, 'test.tsx', [])).resolves.not.toThrow();
    });
  });
});
