import { buildClientSchema, parse } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';
import { plugin, validate } from '../src/index.js';

const schema = buildClientSchema(require('../../../../../dev-test/githunt/schema.json'));

describe('oclif', () => {
  describe('cli', () => {
    it('builds from a read query with single string parameter', async () => {
      const document = parse(`
        query GetEntry($name: String!) {
          entry(repoFullName: $name) {
            repository {
              name
            }
          }
        }
      `);

      const config = {};
      const docs = [{ location: '', document }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      expect(result.content).toMatchSnapshot();
    });

    it('builds from a read query with single enum parameter', async () => {
      const document = parse(`
        query GetFeed($type: FeedType!) {
          feed(type: $type) {
            id
            commentCount
          }
        }
      `);

      const config = {};
      const docs = [{ location: '', document }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      expect(result.content).toMatchSnapshot();
    });

    it('builds from a read query with integer parameters', async () => {
      const document = parse(`
        query GetFeed($type: FeedType!, $offset: Int!, $limit: Int!) {
          feed(type: $type, offset: $offset, limit: $limit) {
            id
            commentCount
          }
        }
      `);

      const config = {};
      const docs = [{ location: '', document }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      expect(result.content).toMatchSnapshot();
    });

    it('reads metadata from the @oclif directive', async () => {
      const document = parse(`
        query GetCurrentUser @oclif(description: "Get Current User", example: "cli get-current-user", example: "hello") {
          currentUser {
            login
          }
        }
      `);

      const config = {};
      const docs = [{ location: '', document }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      expect(result.content).toMatchSnapshot();
    });

    it('builds from a mutation with string and enum type', async () => {
      const document = parse(`
        mutation Vote($name: String!, $type: VoteType!) {
          vote(repoFullName: $name, type: $type) {
            score
          }
        }
      `);

      const config = {};
      const docs = [{ location: '', document }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      expect(result.content).toMatchSnapshot();
    });
  });

  describe('validate', () => {
    it('does not throw when outputFile has a .ts extension', async () => {
      await expect(
        validate(schema, [], {}, { outputFile: 'out.ts' }, 'typescript-oclif'),
      ).resolves.toBeUndefined();
    });

    it('throws when outputFile has an unsupported extension', async () => {
      await expect(
        validate(schema, [], {}, { outputFile: 'out.js' }, 'typescript-oclif'),
      ).rejects.toThrow('requires output file extensions to be ".ts"');
    });
  });
});
