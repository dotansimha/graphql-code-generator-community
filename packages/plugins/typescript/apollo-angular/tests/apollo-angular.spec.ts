import { buildClientSchema, buildSchema, extendSchema, GraphQLSchema, parse } from 'graphql';
import { gql } from 'graphql-tag';
import { mergeOutputs, Types } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { plugin as tsPlugin } from '@graphql-codegen/typescript';
import { plugin as tsDocumentsPlugin } from '@graphql-codegen/typescript-operations';
import { DocumentMode } from '@graphql-codegen/visitor-plugin-common';
import { addToSchema, plugin } from '../src/index.js';

describe('Apollo Angular', () => {
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
    testSchema: GraphQLSchema,
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
    it('should import DocumentNode when using noGraphQLTag', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          noGraphQLTag: true,
        },
        {
          outputFile: 'graphql.tsx',
        },
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import { DocumentNode } from 'graphql';`);
      expect(content.prepend).not.toContain(`import gql from 'graphql-tag';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it(`should use gql import from gqlImport config option`, async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { gqlImport: 'graphql.macro#gql' },
        {
          outputFile: 'graphql.tsx',
        },
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import { gql } from 'graphql.macro';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it(`should add the correct angular imports`, async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
        },
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as Apollo from 'apollo-angular';`);
      expect(content.prepend).toContain(`import { Injectable } from '@angular/core';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it(`should add a constructor and super call (Issue #4366)`, async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`
          constructor(apollo: Apollo.Apollo) {
            super(apollo);
          }
        }
      `);
      await validateTypeScript(content, schema, docs, {});
    });

    it(`should add additional DI for constructor & super call`, async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          additionalDI: ['testService: TestService', 'testService1: TestService1'],
        },
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`
          constructor(apollo: Apollo.Apollo, testService: TestService, testService1: TestService1) {
            super(apollo, testService, testService1);
          }
        }
      `);
      // await validateTypeScript(content, schema, docs, {});
    });

    it(`should add explicit override to document and namedClient property`, async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          addExplicitOverride: true,
          namedClient: 'custom',
        },
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`override document = TestDocument;`);
      expect(content.content).toBeSimilarStringTo(`override client = 'custom';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it(`should add the correct angular imports with override`, async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          apolloAngularPackage: 'my-custom-apollo-angular',
        },
        {
          outputFile: 'graphql.tsx',
        },
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as Apollo from 'my-custom-apollo-angular';`);
      expect(content.prepend).toContain(`import { Injectable } from '@angular/core';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('Should import NgModules and remove NgModule directive', async () => {
      const modifiedSchema = extendSchema(schema, addToSchema);
      expect(modifiedSchema.getDirective('NgModule').name).toBe('NgModule');
      const modulePath = '../my/lazy-module';
      const moduleName = 'LazyModule';

      const myFeed = gql(`
        query MyFeed {
          feed @client @NgModule(module: "${modulePath}#${moduleName}") {
            id
          }
        }
      `);
      const docs = [{ location: '', document: myFeed }];
      const content = (await plugin(
        modifiedSchema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import { ${moduleName} } from '${modulePath}';`);
      expect(content.content).toBeSimilarStringTo(`
        @Injectable({
          providedIn: ${moduleName}
        })
        export class MyFeedGQL
      `);
      expect(content.content).toBeSimilarStringTo(`document = MyFeedDocument;`);
      expect(content.content).not.toContain('@NgModule');
      expect(content.content).toContain('@client');
      await validateTypeScript(content, modifiedSchema, docs, {});
    });

    it('Should import namedClient and remove namedClient directive', async () => {
      const modifiedSchema = extendSchema(schema, addToSchema);
      expect(modifiedSchema.getDirective('namedClient').name).toBe('namedClient');

      const myFeed = gql(`
        query MyFeed {
          feed @namedClient(name: "custom") {
            id
          }
        }
      `);

      const docs = [{ location: '', document: myFeed }];
      const content = (await plugin(
        modifiedSchema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`document = MyFeedDocument;`);

      expect(content.content).toBeSimilarStringTo(`
        client = 'custom';
      `);
      expect(content.content).not.toContain('@namedClient');
      await validateTypeScript(content, modifiedSchema, docs, {});
    });

    it('should output warning if documentMode = external and importDocumentNodeExternallyFrom is not set', async () => {
      jest.spyOn(console, 'warn');
      const docs = [{ location: '', document: basicDoc }];
      await plugin(
        schema,
        docs,
        {
          documentMode: DocumentMode.external,
        },
        {
          outputFile: 'graphql.ts',
        },
      );

      // eslint-disable-next-line no-console
      expect(console.warn).toHaveBeenCalledWith(
        'importDocumentNodeExternallyFrom must be provided if documentMode=external',
      );
    });

    it('output warning if importOperationTypesFrom is set to something other than "Operations"', async () => {
      jest.spyOn(console, 'warn');
      const docs = [{ location: '', document: basicDoc }];
      await plugin(
        schema,
        docs,
        {
          documentMode: DocumentMode.external,
          importOperationTypesFrom: 'Whatever',
        },
        {
          outputFile: 'graphql.ts',
        },
      );

      // eslint-disable-next-line no-console
      expect(console.warn).toHaveBeenCalledWith(
        'importOperationTypesFrom only works correctly when left empty or set to "Operations"',
      );
    });

    it('output warning if importOperationTypesFrom is set and documentMode is not "external"', async () => {
      jest.spyOn(console, 'warn');
      const docs = [{ location: '', document: basicDoc }];
      await plugin(
        schema,
        docs,
        {
          importOperationTypesFrom: 'Operations',
        },
        {
          outputFile: 'graphql.ts',
        },
      );

      // eslint-disable-next-line no-console
      expect(console.warn).toHaveBeenCalledWith(
        '"importOperationTypesFrom" should be used with "documentMode=external" and "importDocumentNodeExternallyFrom"',
      );
    });

    it('output warning if importOperationTypesFrom is set and importDocumentNodeExternallyFrom is not', async () => {
      jest.spyOn(console, 'warn');
      const docs = [{ location: '', document: basicDoc }];
      await plugin(
        schema,
        docs,
        {
          documentMode: DocumentMode.external,
          importOperationTypesFrom: 'Operations',
        },
        {
          outputFile: 'graphql.ts',
        },
      );

      // eslint-disable-next-line no-console
      expect(console.warn).toHaveBeenCalledWith(
        '"importOperationTypesFrom" should be used with "documentMode=external" and "importDocumentNodeExternallyFrom"',
      );
    });

    it('should allow importing operations and documents from another file', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          documentMode: DocumentMode.external,
          importOperationTypesFrom: 'Operations',
          importDocumentNodeExternallyFrom: '@myproject/generated',
        },
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as Operations from '@myproject/generated';`);
      expect(content.content).toContain('Operations.TestQuery');
      expect(content.content).toContain('Operations.TestQueryVariables');
      expect(content.content).toContain('Operations.TestDocument');
      await validateTypeScript(content, schema, docs, {});
    });
  });

  describe('Component', () => {
    it('Should be able to use root schema object', async () => {
      const rootSchema = buildSchema(`
        type RootQuery { f: String }
        schema { query: RootQuery }
      `);
      const query = gql`
        query test {
          f
        }
      `;
      const docs = [{ location: '', document: query }];
      const content = (await plugin(
        rootSchema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`
        @Injectable({
          providedIn: 'root'
        })
        export class TestGQL extends Apollo.Query
      `);
      await validateTypeScript(content, rootSchema, docs, {});
    });

    it('Should handle @client', async () => {
      const myFeed = gql`
        query MyFeed {
          feed @client {
            id
          }
        }
      `;

      const docs = [{ location: '', document: myFeed }];
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`document = MyFeedDocument;`);

      await validateTypeScript(content, schema, docs, {});
    });
  });

  describe('configuration', () => {
    it('should be allow to define namedClient and NgModule in config', async () => {
      const modifiedSchema = extendSchema(schema, addToSchema);
      const myFeed = gql(`
        query MyFeed {
          feed {
            id
          }
        }
      `);
      const myExtraFeed = gql(`
        query MyExtraFeed {
          feed @NgModule(module: "./extra#ExtraModule") @namedClient(name: "extra") {
            id
          }
        }
      `);
      const docs = [
        { location: '', document: myFeed },
        { location: 'a.ts', document: myExtraFeed },
      ];
      const content = (await plugin(
        modifiedSchema,
        docs,
        {
          ngModule: './path/to/file#AppModule',
          namedClient: 'custom',
        },
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      // NgModule
      expect(content.prepend).toContain(`import { AppModule } from './path/to/file';`);
      expect(content.content).toBeSimilarStringTo(`
        @Injectable({
          providedIn: AppModule
        })
        export class MyFeedGQL
      `);
      expect(content.prepend).toContain(`import { ExtraModule } from './extra';`);

      expect(content.content).toBeSimilarStringTo(`
        @Injectable({
          providedIn: ExtraModule
        })
        export class MyExtraFeed
      `);
      expect(content.content).not.toContain('@NgModule');

      // NamedClient
      expect(content.content).toBeSimilarStringTo(`client = 'custom';`);
      expect(content.content).toBeSimilarStringTo(`client = 'extra';`);
      expect(content.content).not.toContain('@namedClient');

      await validateTypeScript(content, modifiedSchema, docs, {});
    });
    it('should be allowed to define custom operation suffixes in config', async () => {
      const modifiedSchema = extendSchema(schema, addToSchema);
      const myFeed = gql(`
        query MyFeed {
          feed {
            id
          }
        }
      `);
      const vote = gql(`
      mutation vote($repoFullName: String!, $type: VoteType!) {
    vote(repoFullName: $repoFullName, type: $type) {
      score
      id
      vote {
        vote_value
      }
    }
  }
      `);
      const commentAdded = gql(`
        subscription onCommentAdded($repoFullName: String!) {
        commentAdded(repoFullName: $repoFullName) {
          id
          postedBy {
            login
            html_url
          }
          createdAt
          content
        }
      }
      `);
      const docs = [
        { location: '', document: myFeed },
        { location: '', document: commentAdded },
        { location: '', document: vote },
      ];
      const content = (await plugin(
        modifiedSchema,
        docs,
        {
          querySuffix: 'QueryService',
          mutationSuffix: 'MutationService',
          subscriptionSuffix: 'SubscriptionService',
        },
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      expect(content.content).toContain(`export class MyFeedQueryService`);
      expect(content.content).toContain(`export class OnCommentAddedSubscriptionService`);
      expect(content.content).toContain(`export class VoteMutationService`);
      await validateTypeScript(content, modifiedSchema, docs, {});
    });
  });

  describe('SDK Service', () => {
    it('should generate a SDK service', async () => {
      const modifiedSchema = extendSchema(schema, addToSchema);
      const myFeed = gql(`
        query MyFeed {
          feed {
            id
          }
        }
      `);
      const docs = [{ location: '', document: myFeed }];
      const content = (await plugin(
        modifiedSchema,
        docs,
        { sdkClass: true },
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      // NgModule
      expect(content.prepend).toContain(`import * as ApolloCore from '@apollo/client/core';`);
      expect(content.content).toBeSimilarStringTo(`
        @Injectable({ providedIn: 'root' })
        export class ApolloAngularSDK {
        constructor(
          private myFeedGql: MyFeedGQL
        ) {}

        myFeed(variables?: MyFeedQueryVariables, options?: QueryOptionsAlone<MyFeedQueryVariables>) {
          return this.myFeedGql.fetch(variables, options)
        }

        myFeedWatch(variables?: MyFeedQueryVariables, options?: WatchQueryOptionsAlone<MyFeedQueryVariables>) {
          return this.myFeedGql.watch(variables, options)
        }
        }
      `);
      // await validateTypeScript(content, modifiedSchema, docs, {});
    });

    it('should include only the required SDK types for query operations', async () => {
      const modifiedSchema = extendSchema(schema, addToSchema);
      const myFeed = gql(`
        query MyFeed {
          feed {
            id
          }
        }
      `);
      const docs = [{ location: '', document: myFeed }];
      const content = (await plugin(
        modifiedSchema,
        docs,
        { sdkClass: true },
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`
        type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

        interface WatchQueryOptionsAlone<V> extends Omit<ApolloCore.WatchQueryOptions<V>, 'query' | 'variables'> {}

        interface QueryOptionsAlone<V> extends Omit<ApolloCore.QueryOptions<V>, 'query' | 'variables'> {}`);
      expect(content.content).not.toContain('SubscriptionOptionsAlone');
      expect(content.content).not.toContain('MutationOptionsAlone');
    });

    it('should include only the required SDK types for mutation operations', async () => {
      const modifiedSchema = extendSchema(schema, addToSchema);
      const myFeed = gql(`
        mutation Update($arg: Int) {
          update(arg: $arg) {
            id
          }
        }
      `);
      const docs = [{ location: '', document: myFeed }];
      const content = (await plugin(
        modifiedSchema,
        docs,
        { sdkClass: true },
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`
        type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

        interface MutationOptionsAlone<T, V> extends Omit<ApolloCore.MutationOptions<T, V>, 'mutation' | 'variables'> {}`);
      expect(content.content).not.toContain('WatchOptionsAlone');
      expect(content.content).not.toContain('QueryOptionsAlone');
      expect(content.content).not.toContain('SubscriptionOptionsAlone');
    });

    it('should include only the required SDK types for subscription operations', async () => {
      const modifiedSchema = extendSchema(schema, addToSchema);
      const myFeed = gql(`
        subscription MyFeed {
          feed {
            id
          }
        }
      `);
      const docs = [{ location: '', document: myFeed }];
      const content = (await plugin(
        modifiedSchema,
        docs,
        { sdkClass: true },
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`
        type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

        interface SubscriptionOptionsAlone<V> extends Omit<ApolloCore.SubscriptionOptions<V>, 'query' | 'variables'> {}`);
      expect(content.content).not.toContain('WatchOptionsAlone');
      expect(content.content).not.toContain('QueryOptionsAlone');
      expect(content.content).not.toContain('MutationOptionsAlone');
    });

    it('should generate a SDK service with custom settings', async () => {
      const modifiedSchema = extendSchema(schema, addToSchema);
      const myFeed = gql(`
        query MyFeed {
          feed {
            id
          }
        }
      `);
      const docs = [{ location: '', document: myFeed }];
      const content = (await plugin(
        modifiedSchema,
        docs,
        {
          sdkClass: true,
          serviceName: 'MySDK',
          serviceProvidedInRoot: false,
        },
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      // NgModule
      expect(content.prepend).toContain(`import * as ApolloCore from '@apollo/client/core';`);
      expect(content.content).toBeSimilarStringTo(`
        @Injectable()
        export class MySDK {
        constructor(
          private myFeedGql: MyFeedGQL
        ) {}

        myFeed(variables?: MyFeedQueryVariables, options?: QueryOptionsAlone<MyFeedQueryVariables>) {
          return this.myFeedGql.fetch(variables, options)
        }

        myFeedWatch(variables?: MyFeedQueryVariables, options?: WatchQueryOptionsAlone<MyFeedQueryVariables>) {
          return this.myFeedGql.watch(variables, options)
        }
        }
      `);
      // await validateTypeScript(content, modifiedSchema, docs, {});
    });

    it('should generate a SDK service for Apollo Angular 1.0 on demand', async () => {
      const modifiedSchema = extendSchema(schema, addToSchema);
      const myFeed = gql(`
        query MyFeed {
          feed {
            id
          }
        }
      `);
      const docs = [{ location: '', document: myFeed }];
      const content = (await plugin(
        modifiedSchema,
        docs,
        {
          sdkClass: true,
          apolloAngularVersion: 1,
        },
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as ApolloCore from 'apollo-client';`);
    });

    it('should generate a SDK service with a requested providedIn value', async () => {
      const modifiedSchema = extendSchema(schema, addToSchema);
      const myFeed = gql(`
        query MyFeed {
          feed {
            id
          }
        }
      `);
      const docs = [{ location: '', document: myFeed }];
      const content = (await plugin(
        modifiedSchema,
        docs,
        {
          sdkClass: true,
          serviceProvidedIn: '../app.module#AppModule',
        },
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      // NgModule import
      expect(content.prepend).toContain(`import { AppModule } from '../app.module';`);
      // NgModule in `providedIn`
      expect(content.content).toBeSimilarStringTo(`
        @Injectable({ providedIn: AppModule })
        export class ApolloAngularSDK {
      `);
    });

    it('should combine variables into options for apolloAngularVersion 12+', async () => {
      const modifiedSchema = extendSchema(schema, addToSchema);
      const myFeed = gql(`
        query MyFeed {
          feed {
            id
          }
        }
      `);
      const docs = [{ location: '', document: myFeed }];
      const content = (await plugin(
        modifiedSchema,
        docs,
        {
          sdkClass: true,
          apolloAngularVersion: 12,
        },
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      // For v12+, use type aliases with Apollo.Apollo namespace types
      expect(content.content).toBeSimilarStringTo(`
        type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

        type WatchQueryOptionsAlone<T, V extends ApolloCore.OperationVariables> = Omit<Apollo.Apollo.WatchQueryOptions<T, V>, 'query' | 'variables'>

        type QueryOptionsAlone<T, V extends ApolloCore.OperationVariables> = Omit<Apollo.Apollo.QueryOptions<T, V>, 'query' | 'variables'>`);

      // For v12+, SDK methods should keep same signature but combine variables into options internally
      // Watch method should have explicit return type for proper type inference
      expect(content.content).toBeSimilarStringTo(`
        myFeed(variables?: MyFeedQueryVariables, options?: QueryOptionsAlone<MyFeedQuery, MyFeedQueryVariables>) {
          return this.myFeedGql.fetch({ ...options, variables })
        }

        myFeedWatch(variables?: MyFeedQueryVariables, options?: WatchQueryOptionsAlone<MyFeedQuery, MyFeedQueryVariables>): Apollo.QueryRef<MyFeedQuery, MyFeedQueryVariables> {
          return this.myFeedGql.watch({ ...options, variables })
        }
      `);
    });

    it('should combine variables into options for mutations with apolloAngularVersion 12+', async () => {
      const modifiedSchema = extendSchema(schema, addToSchema);
      const myMutation = gql(`
        mutation Update($arg: Int) {
          update(arg: $arg) {
            id
          }
        }
      `);
      const docs = [{ location: '', document: myMutation }];
      const content = (await plugin(
        modifiedSchema,
        docs,
        {
          sdkClass: true,
          apolloAngularVersion: 12,
        },
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      // For v12+, use type alias with Apollo.Apollo namespace
      expect(content.content).toBeSimilarStringTo(`
        type MutationOptionsAlone<T, V extends ApolloCore.OperationVariables> = Omit<Apollo.Apollo.MutateOptions<T, V>, 'mutation' | 'variables'>`);

      // For v12+, SDK methods should combine variables into options internally
      expect(content.content).toBeSimilarStringTo(`
        update(variables?: UpdateMutationVariables, options?: MutationOptionsAlone<UpdateMutation, UpdateMutationVariables>) {
          return this.updateGql.mutate({ ...options, variables })
        }
      `);
    });

    it('should combine variables into options for subscriptions with apolloAngularVersion 12+', async () => {
      const modifiedSchema = extendSchema(schema, addToSchema);
      const mySubscription = gql(`
        subscription MyFeed {
          feed {
            id
          }
        }
      `);
      const docs = [{ location: '', document: mySubscription }];
      const content = (await plugin(
        modifiedSchema,
        docs,
        {
          sdkClass: true,
          apolloAngularVersion: 12,
        },
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      // For v12+, use type alias with Apollo.Apollo namespace
      expect(content.content).toBeSimilarStringTo(`
        type SubscriptionOptionsAlone<T, V extends ApolloCore.OperationVariables> = Omit<Apollo.Apollo.SubscribeOptions<T, V>, 'query' | 'variables'>`);

      // For v12+, SDK methods should combine variables into options internally
      expect(content.content).toBeSimilarStringTo(`
        myFeed(variables?: MyFeedSubscriptionVariables, options?: SubscriptionOptionsAlone<MyFeedSubscription, MyFeedSubscriptionVariables>) {
          return this.myFeedGql.subscribe({ ...options, variables })
        }
      `);
    });

    it('should use legacy call syntax for apolloAngularVersion below 12', async () => {
      const modifiedSchema = extendSchema(schema, addToSchema);
      const myFeed = gql(`
        query MyFeed {
          feed {
            id
          }
        }
      `);
      const docs = [{ location: '', document: myFeed }];
      const content = (await plugin(
        modifiedSchema,
        docs,
        {
          sdkClass: true,
          apolloAngularVersion: 11,
        },
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      // For v11 and below, interfaces should not have OperationVariables constraint
      expect(content.content).toBeSimilarStringTo(`
        interface WatchQueryOptionsAlone<V> extends Omit<ApolloCore.WatchQueryOptions<V>, 'query' | 'variables'> {}`);
      expect(content.content).not.toContain('OperationVariables');

      // For v11 and below, SDK methods should pass variables and options separately
      expect(content.content).toBeSimilarStringTo(`
        myFeed(variables?: MyFeedQueryVariables, options?: QueryOptionsAlone<MyFeedQueryVariables>) {
          return this.myFeedGql.fetch(variables, options)
        }
      `);
    });
  });

  describe('near-operation-file', () => {
    it('Should use Operations when preset is near-operation-file', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          documentMode: DocumentMode.external,
          importDocumentNodeExternallyFrom: 'near-operation-file',
        },
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`@Injectable({
        providedIn: 'root'
      })
      export class TestGQL extends Apollo.Query<TestQuery, TestQueryVariables> {
        document = Operations.TestDocument;

        constructor(apollo: Apollo.Apollo) {
          super(apollo);
        }
      }`);
    });
  });

  describe('others', () => {
    it('should handle fragments', async () => {
      const myFeed = gql`
        query MyFeed {
          feed {
            ...MyEntry
          }
        }

        fragment MyEntry on Entry {
          id
          commentCount
        }
      `;

      const docs = [{ location: '', document: myFeed }];
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        },
      )) as Types.ComplexPluginOutput;

      await validateTypeScript(content, schema, docs, {});
    });
  });
});
