import { buildClientSchema, GraphQLSchema, parse } from 'graphql';
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

describe('graphql-request', () => {
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
    it('Should generate a correct wrap method', async () => {
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

    it('Should generate a correct wrap method with documentMode=string', async () => {
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

    describe('nested fragments', () => {
      const fragmentDoc = parse(/* GraphQL */ `
        fragment OwnerFields on User {
          avatar_url
        }

        fragment FeedEntryFields on Entry {
          id
          repository {
            owner {
              ...OwnerFields
            }
          }
        }

        query feedWithFragments {
          feed {
            ...FeedEntryFields
          }
        }
      `);

      it('Should generate nested fragments with the default graphQLTag documentMode', async () => {
        const config = {};
        const docs = [{ location: '', document: fragmentDoc }];
        // PluginFunction returns string | ComplexPluginOutput; narrowing needs a plugin return type change in src
        const result = (await plugin(schema, docs, config, {
          outputFile: 'graphql.ts',
        })) as Types.ComplexPluginOutput;

        const output = await validate(result, config, docs, schema, '');

        expect(output).toMatchInlineSnapshot(`
          "export type Maybe<T> = T | null;
          export type InputMaybe<T> = Maybe<T>;
          export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
          export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
          export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
          export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
          export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
          import { GraphQLClient, type RequestOptions } from 'graphql-request';
          type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
          import gql from 'graphql-tag';
          /** All built-in and custom scalars, mapped to their actual values */
          export type Scalars = {
            ID: { input: string; output: string; }
            String: { input: string; output: string; }
            Boolean: { input: boolean; output: boolean; }
            Int: { input: number; output: number; }
            Float: { input: number; output: number; }
          };

          export type Query = {
            __typename?: 'Query';
            /** A feed of repository submissions */
            feed?: Maybe<Array<Maybe<Entry>>>;
            /** A single entry */
            entry?: Maybe<Entry>;
            /** Return the currently logged in user, or null if nobody is logged in */
            currentUser?: Maybe<User>;
          };


          export type QueryFeedArgs = {
            type: FeedType;
            offset?: InputMaybe<Scalars['Int']['input']>;
            limit?: InputMaybe<Scalars['Int']['input']>;
          };


          export type QueryEntryArgs = {
            repoFullName: Scalars['String']['input'];
          };

          /** A list of options for the sort order of the feed */
          export enum FeedType {
            /** Sort by a combination of freshness and score, using Reddit's algorithm */
            Hot = 'HOT',
            /** Newest entries first */
            New = 'NEW',
            /** Highest score entries first */
            Top = 'TOP'
          }

          /** Information about a GitHub repository submitted to GitHunt */
          export type Entry = {
            __typename?: 'Entry';
            /** Information about the repository from GitHub */
            repository: Repository;
            /** The GitHub user who submitted this entry */
            postedBy: User;
            /** A timestamp of when the entry was submitted */
            createdAt: Scalars['Float']['output'];
            /** The score of this repository, upvotes - downvotes */
            score: Scalars['Int']['output'];
            /** The hot score of this repository */
            hotScore: Scalars['Float']['output'];
            /** Comments posted about this repository */
            comments: Array<Maybe<Comment>>;
            /** The number of comments posted about this repository */
            commentCount: Scalars['Int']['output'];
            /** The SQL ID of this entry */
            id: Scalars['Int']['output'];
            /** XXX to be changed */
            vote: Vote;
          };


          /** Information about a GitHub repository submitted to GitHunt */
          export type EntryCommentsArgs = {
            limit?: InputMaybe<Scalars['Int']['input']>;
            offset?: InputMaybe<Scalars['Int']['input']>;
          };

          /**
           * A repository object from the GitHub API. This uses the exact field names returned by the
           * GitHub API for simplicity, even though the convention for GraphQL is usually to camel case.
           */
          export type Repository = {
            __typename?: 'Repository';
            /** Just the name of the repository, e.g. GitHunt-API */
            name: Scalars['String']['output'];
            /** The full name of the repository with the username, e.g. apollostack/GitHunt-API */
            full_name: Scalars['String']['output'];
            /** The description of the repository */
            description?: Maybe<Scalars['String']['output']>;
            /** The link to the repository on GitHub */
            html_url: Scalars['String']['output'];
            /** The number of people who have starred this repository on GitHub */
            stargazers_count: Scalars['Int']['output'];
            /** The number of open issues on this repository on GitHub */
            open_issues_count?: Maybe<Scalars['Int']['output']>;
            /** The owner of this repository on GitHub, e.g. apollostack */
            owner?: Maybe<User>;
          };

          /** A user object from the GitHub API. This uses the exact field names returned from the GitHub API. */
          export type User = {
            __typename?: 'User';
            /** The name of the user, e.g. apollostack */
            login: Scalars['String']['output'];
            /** The URL to a directly embeddable image for this user's avatar */
            avatar_url: Scalars['String']['output'];
            /** The URL of this user's GitHub page */
            html_url: Scalars['String']['output'];
          };

          /** A comment about an entry, submitted by a user */
          export type Comment = {
            __typename?: 'Comment';
            /** The SQL ID of this entry */
            id: Scalars['Int']['output'];
            /** The GitHub user who posted the comment */
            postedBy: User;
            /** A timestamp of when the comment was posted */
            createdAt: Scalars['Float']['output'];
            /** The text of the comment */
            content: Scalars['String']['output'];
            /** The repository which this comment is about */
            repoName: Scalars['String']['output'];
          };

          /** XXX to be removed */
          export type Vote = {
            __typename?: 'Vote';
            vote_value: Scalars['Int']['output'];
          };

          export type Mutation = {
            __typename?: 'Mutation';
            /** Submit a new repository, returns the new submission */
            submitRepository?: Maybe<Entry>;
            /** Vote on a repository submission, returns the submission that was voted on */
            vote?: Maybe<Entry>;
            /** Comment on a repository, returns the new comment */
            submitComment?: Maybe<Comment>;
          };


          export type MutationSubmitRepositoryArgs = {
            repoFullName: Scalars['String']['input'];
          };


          export type MutationVoteArgs = {
            repoFullName: Scalars['String']['input'];
            type: VoteType;
          };


          export type MutationSubmitCommentArgs = {
            repoFullName: Scalars['String']['input'];
            commentContent: Scalars['String']['input'];
          };

          /** The type of vote to record, when submitting a vote */
          export enum VoteType {
            Up = 'UP',
            Down = 'DOWN',
            Cancel = 'CANCEL'
          }

          export type Subscription = {
            __typename?: 'Subscription';
            /** Subscription fires on every comment added */
            commentAdded?: Maybe<Comment>;
          };


          export type SubscriptionCommentAddedArgs = {
            repoFullName: Scalars['String']['input'];
          };
          export type OwnerFieldsFragment = { __typename?: 'User', avatar_url: string };

          export type FeedEntryFieldsFragment = { __typename?: 'Entry', id: number, repository: { __typename?: 'Repository', owner?: { __typename?: 'User', avatar_url: string } | null } };

          export type FeedWithFragmentsQueryVariables = Exact<{ [key: string]: never; }>;


          export type FeedWithFragmentsQuery = { __typename?: 'Query', feed?: Array<{ __typename?: 'Entry', id: number, repository: { __typename?: 'Repository', owner?: { __typename?: 'User', avatar_url: string } | null } } | null> | null };
          export const OwnerFieldsFragmentDoc = gql\`
              fragment OwnerFields on User {
            avatar_url
          }
              \`;
          export const FeedEntryFieldsFragmentDoc = gql\`
              fragment FeedEntryFields on Entry {
            id
            repository {
              owner {
                ...OwnerFields
              }
            }
          }
              \`;
          export const FeedWithFragmentsDocument = gql\`
              query feedWithFragments {
            feed {
              ...FeedEntryFields
            }
          }
              \${FeedEntryFieldsFragmentDoc}
          \${OwnerFieldsFragmentDoc}\`;

          export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


          const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

          export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
            return {
              feedWithFragments(variables?: FeedWithFragmentsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FeedWithFragmentsQuery> {
                return withWrapper((wrappedRequestHeaders) => client.request<FeedWithFragmentsQuery>({ document: FeedWithFragmentsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'feedWithFragments', 'query', variables);
              }
            };
          }
          export type Sdk = ReturnType<typeof getSdk>;"
        `);
      });

      it('Should generate nested fragments with documentMode = "string"', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        try {
          const config = { documentMode: DocumentMode.string };
          const docs = [{ location: '', document: fragmentDoc }];
          // PluginFunction returns string | ComplexPluginOutput; narrowing needs a plugin return type change in src
          const result = (await plugin(schema, docs, config, {
            outputFile: 'graphql.ts',
          })) as Types.ComplexPluginOutput;

          const output = await validate(result, config, docs, schema, '');

          expect(output).toMatchSnapshot();
        } finally {
          warn.mockRestore();
        }
      });
    });

    it('Should allow passing wrapper arg to generated getSdk', async () => {
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

    it('Should support useTypeImports', async () => {
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

    it('Should support emitLegacyCommonJSImports: false by emitting imports with extensions', async () => {
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
    });

    it('Should support rawRequest when documentMode = "documentNode"', async () => {
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

    it('Should not import print as type when supporting useTypeImports and rawRequest and documentMode = "documentNode"', async () => {
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
    });

    it('Should only import GraphQLError when rawRequest is true and documentMode = "string"', async () => {
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
    });

    it('Should remap documentMode = "string" to "plainString" and warn once per run', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      try {
        vi.resetModules();
        const { plugin: freshPlugin } = await import('../src/index.js');
        // Multiple visitors in the same run (e.g. near-operation-file) must not repeat the warning
        await freshPlugin(
          schema,
          [{ location: '', document: basicDoc }],
          { documentMode: DocumentMode.string },
          { outputFile: 'graphql.ts' },
        );
        // PluginFunction returns string | ComplexPluginOutput; narrowing needs a plugin return type change in src
        const result = (await freshPlugin(
          schema,
          [{ location: '', document: basicDoc }],
          { documentMode: DocumentMode.string },
          { outputFile: 'graphql.ts' },
        )) as Types.ComplexPluginOutput;

        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn).toHaveBeenCalledWith(
          "[typescript-graphql-request] documentMode: 'string' does not work with this plugin (it references an undeclared TypedDocumentString), and has been remapped to 'plainString' for correctness. Set documentMode: 'plainString' to silence this warning.",
        );
        expect(result.content).toContain('export const FeedDocument = `');
        expect(result.content).not.toContain('TypedDocumentString');
      } finally {
        warn.mockRestore();
      }
    });

    it('Should not warn or use TypedDocumentString when documentMode = "plainString"', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      try {
        const result = (await plugin(
          schema,
          [{ location: '', document: basicDoc }],
          { documentMode: DocumentMode.plainString },
          { outputFile: 'graphql.ts' },
        )) as Types.ComplexPluginOutput;

        expect(warn).not.toHaveBeenCalled();
        expect(result.content).toContain('export const FeedDocument = `');
        expect(result.content).not.toContain('TypedDocumentString');
      } finally {
        warn.mockRestore();
      }
    });

    it('Should not import or call print when rawRequest is true and documentMode = "plainString"', async () => {
      const result = (await plugin(
        schema,
        [{ location: '', document: basicDoc }],
        { rawRequest: true, documentMode: DocumentMode.plainString },
        { outputFile: 'graphql.ts' },
      )) as Types.ComplexPluginOutput;

      expect(result.prepend).toContain(`import { GraphQLError } from 'graphql'`);
      expect(result.prepend.join('\n')).not.toContain('print');
      expect(result.content).not.toContain('print(');
      expect(result.content).not.toContain('TypedDocumentString');
      expect(result.content).toContain('client.rawRequest<FeedQuery>(FeedDocument, variables');
    });

    it('Should support extensionType when rawRequest is true and documentMode = "DocumentNode"', async () => {
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
    });

    it('extensionType should be irrelevant when rawRequest is false', async () => {
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

      const warnSpy = vi.spyOn(console, 'warn');
      const docs = [{ location: 'file.graphlq', document: doc }];
      const result = (await plugin(schema, docs, {}, {})) as Types.ComplexPluginOutput;
      expect(result.content).not.toContain('feed');
      expect(warnSpy.mock.calls.length).toBe(1);
      expect(warnSpy.mock.calls[0][0]).toContain('Anonymous GraphQL operation was ignored');
      expect(warnSpy.mock.calls[0][1]).toContain('feed');
      warnSpy.mockRestore();
    });

    it('#4748 - integration with importDocumentNodeExternallyFrom', async () => {
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

    it('#7114 - honor importOperationTypesFrom', async () => {
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
