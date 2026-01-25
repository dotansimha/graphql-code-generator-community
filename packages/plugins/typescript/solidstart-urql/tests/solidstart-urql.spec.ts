import { buildClientSchema, parse } from 'graphql';
import { mergeOutputs, Types } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { plugin as tsPlugin } from '@graphql-codegen/typescript';
import { plugin as tsDocumentsPlugin } from '@graphql-codegen/typescript-operations';
import { plugin } from '../src/index.js';

describe('typescript-solidstart-urql', () => {
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
    it('should import @urql/solid-start dependencies when primitives are enabled', async () => {
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
        `import { createQuery, createMutation } from '@urql/solid-start';`,
      );
      expect(content.prepend).toContain(
        `import { createSubscription, type CreateQueryArgs } from '@urql/solid';`,
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
          urqlImportFrom: 'custom-urql-package',
        },
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(
        `import { createQuery, createMutation } from 'custom-urql-package';`,
      );
      await validateTypeScript(content, schema, docs, {});
    });

    it('should not import urql dependencies when withPrimitives is false', async () => {
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

  describe('Query Primitives', () => {
    it('should generate query primitive with correct signature', async () => {
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

      expect(content.content).toContain('export const queryGetUser');
      expect(content.content).toContain('createQuery<GetUserQuery, GetUserQueryVariables>');
      expect(content.content).toContain('GetUserDocument');
      expect(content.content).toContain("'get-user'"); // kebab-case key
      await validateTypeScript(content, schema, docs, {});
    });

    it('should generate query primitive without variables', async () => {
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

      expect(content.content).toContain('export const queryGetFeed');
      expect(content.content).toContain('createQuery<GetFeedQuery, GetFeedQueryVariables>');
      expect(content.content).toContain("'get-feed'");
      await validateTypeScript(content, schema, docs, {});
    });

    it('should not generate primitives when withPrimitives is false', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { withPrimitives: false },
        { outputFile: 'graphql.ts' },
      )) as Types.ComplexPluginOutput;

      expect(content.content).not.toContain('queryTest');
      expect(content.content).not.toContain('createQuery');
    });
  });

  describe('Mutation Primitives', () => {
    it('should generate mutation primitive (action)', async () => {
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

      expect(content.content).toContain('export const actionSubmitComment');
      expect(content.content).toContain(
        'createMutation<SubmitCommentMutation, SubmitCommentMutationVariables>',
      );
      expect(content.content).toContain('SubmitCommentDocument');
      expect(content.content).toContain("'submit-comment'");
      await validateTypeScript(content, schema, docs, {});
    });
  });

  describe('Subscription Primitives', () => {
    it('should generate subscription primitive', async () => {
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

      expect(content.content).toContain('export const useSubscriptionOnCommentAdded');
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

      expect(content.content).toContain('query');
    });

    it('should default urqlImportFrom to @urql/solid-start', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { withPrimitives: true },
        { outputFile: 'graphql.ts' },
      )) as Types.ComplexPluginOutput;

      const imports = content.prepend?.join('\n') || '';
      expect(imports).toContain("from '@urql/solid-start'");
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
