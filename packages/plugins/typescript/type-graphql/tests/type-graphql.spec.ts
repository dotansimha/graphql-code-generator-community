import { buildSchema } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';
import '@graphql-codegen/testing';
import { plugin } from '../src/index.js';

const testCases = [
  ['type-graphql', 'TypeGraphQL', {}],
  [
    '@nestjs/graphql',
    'NestJSGraphQL',
    {
      useNestJSGraphQL: true,
    },
  ],
];

describe.each(testCases)('%s', (libName, importFrom, config) => {
  it('should expose Maybe', async () => {
    const schema = buildSchema(/* GraphQL */ `
      scalar A
    `);
    const result = await plugin(schema, [], config || {}, { outputFile: '' });
    expect(result.prepend).toBeSimilarStringTo('export type Maybe<T> =');
  });

  it('should expose Exact', async () => {
    const schema = buildSchema(/* GraphQL */ `
      scalar A
    `);
    const result = await plugin(schema, [], config || {}, { outputFile: '' });
    expect(result.prepend).toBeSimilarStringTo('export type Exact<');
  });

  it('should expose FixDecorator', async () => {
    const schema = buildSchema(/* GraphQL */ `
      scalar A
    `);
    const result = await plugin(schema, [], config || {}, { outputFile: '' });
    expect(result.prepend).toBeSimilarStringTo('export type FixDecorator<T> = T;');
  });

  it('should generate import/export', async () => {
    const schema = buildSchema(/* GraphQL */ `
      scalar A
    `);
    const result = await plugin(schema, [], config || {}, { outputFile: '' });

    expect(result.prepend).toBeSimilarStringTo(`import * as ${importFrom} from '${libName}';
    export { ${importFrom} };`);
  });

  it('should generate classes for object types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      "custom enum"
      enum MyEnum {
        "this is a"
        A
        "this is b"
        B
      }
    `);
    const result = await plugin(schema, [], config || {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      /** custom enum */
      export enum MyEnum {
        /** this is a */
        A = 'A',
        /** this is b */
        B = 'B'
      }
      ${importFrom}.registerEnumType(MyEnum, { name: 'MyEnum' });`);
  });

  it('should generate classes for object types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type A {
        id: ID
        mandatoryId: ID!
        str: String
        mandatoryStr: String!
        bool: Boolean
        mandatoryBool: Boolean!
        int: Int
        mandatoryInt: Int!
        float: Float
        mandatoryFloat: Float!
        b: B
        mandatoryB: B!
        arr: [String!]
        mandatoryArr: [String!]!
      }
      type B {
        id: ID
      }
    `);

    const result = await plugin(schema, [], config || {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.ObjectType()
      export class A {
        __typename?: 'A';
        @${importFrom}.Field(type => ${importFrom}.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;
        @${importFrom}.Field(type => ${importFrom}.ID)
        mandatoryId!: Scalars['ID'];
        @${importFrom}.Field(type => String, { nullable: true })
        str?: Maybe<Scalars['String']>;
        @${importFrom}.Field(type => String)
        mandatoryStr!: Scalars['String'];
        @${importFrom}.Field(type => Boolean, { nullable: true })
        bool?: Maybe<Scalars['Boolean']>;
        @${importFrom}.Field(type => Boolean)
        mandatoryBool!: Scalars['Boolean'];
        @${importFrom}.Field(type => ${importFrom}.Int, { nullable: true })
        int?: Maybe<Scalars['Int']>;
        @${importFrom}.Field(type => ${importFrom}.Int)
        mandatoryInt!: Scalars['Int'];
        @${importFrom}.Field(type => ${importFrom}.Float, { nullable: true })
        float?: Maybe<Scalars['Float']>;
        @${importFrom}.Field(type => ${importFrom}.Float)
        mandatoryFloat!: Scalars['Float'];
        @${importFrom}.Field(type => B, { nullable: true })
        b?: Maybe<B>;
        @${importFrom}.Field(type => B)
        mandatoryB!: FixDecorator<B>;
        @${importFrom}.Field(type => [String], { nullable: true })
        arr?: Maybe<Array<Scalars['String']>>;
        @${importFrom}.Field(type => [String])
        mandatoryArr!: Array<Scalars['String']>;
      }
    `);
  });

  it('should generate classes implementing interfaces for object types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Test implements ITest {
        id: ID
        mandatoryStr: String!
      }
      interface ITest {
        id: ID
      }
    `);

    const result = await plugin(schema, [], config || {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.ObjectType({ implements: ITest })
      export class Test extends ITest {
        __typename?: 'Test';
        @${importFrom}.Field(type => ${importFrom}.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;
        @${importFrom}.Field(type => String)
        mandatoryStr!: Scalars['String'];
      }
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.InterfaceType()
      export abstract class ITest {

        @${importFrom}.Field(type => ${importFrom}.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;
      }
    `);
  });

  it('should generate classes for input types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      input A {
        id: ID
        mandatoryId: ID!
        str: String
        mandatoryStr: String!
        bool: Boolean
        mandatoryBool: Boolean!
        int: Int
        mandatoryInt: Int!
        float: Float
        mandatoryFloat: Float!
        b: B
        mandatoryB: B!
        arr: [String!]
        mandatoryArr: [String!]!
      }
      input B {
        id: ID
      }
    `);

    const result = await plugin(schema, [], config || {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.InputType()
      export class A {

        @${importFrom}.Field(type => ${importFrom}.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;

        @${importFrom}.Field(type => ${importFrom}.ID)
        mandatoryId!: Scalars['ID'];

        @${importFrom}.Field(type => String, { nullable: true })
        str?: Maybe<Scalars['String']>;

        @${importFrom}.Field(type => String)
        mandatoryStr!: Scalars['String'];

        @${importFrom}.Field(type => Boolean, { nullable: true })
        bool?: Maybe<Scalars['Boolean']>;

        @${importFrom}.Field(type => Boolean)
        mandatoryBool!: Scalars['Boolean'];

        @${importFrom}.Field(type => ${importFrom}.Int, { nullable: true })
        int?: Maybe<Scalars['Int']>;

        @${importFrom}.Field(type => ${importFrom}.Int)
        mandatoryInt!: Scalars['Int'];

        @${importFrom}.Field(type => ${importFrom}.Float, { nullable: true })
        float?: Maybe<Scalars['Float']>;

        @${importFrom}.Field(type => ${importFrom}.Float)
        mandatoryFloat!: Scalars['Float'];

        @${importFrom}.Field(type => B, { nullable: true })
        b?: Maybe<B>;

        @${importFrom}.Field(type => B)
        mandatoryB!: FixDecorator<B>;

        @${importFrom}.Field(type => [String], { nullable: true })
        arr?: Maybe<Array<Scalars['String']>>;

        @${importFrom}.Field(type => [String])
        mandatoryArr!: Array<Scalars['String']>;
      }
    `);
  });

  it('should generate an args type', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Mutation {
        test(
          id: ID
          mandatoryId: ID!
          str: String
          mandatoryStr: String!
          bool: Boolean
          mandatoryBool: Boolean!
          int: Int
          mandatoryInt: Int!
          float: Float
          mandatoryFloat: Float!
          b: B
          mandatoryB: B!
          arr: [String!]
          mandatoryArr: [String!]!
        ): Boolean!
      }

      input B {
        id: ID
      }
    `);

    const result = await plugin(schema, [], config || {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.ArgsType()
      export class MutationTestArgs {

        @${importFrom}.Field(type => ${importFrom}.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;

        @${importFrom}.Field(type => ${importFrom}.ID)
        mandatoryId!: Scalars['ID'];

        @${importFrom}.Field(type => String, { nullable: true })
        str?: Maybe<Scalars['String']>;

        @${importFrom}.Field(type => String)
        mandatoryStr!: Scalars['String'];

        @${importFrom}.Field(type => Boolean, { nullable: true })
        bool?: Maybe<Scalars['Boolean']>;

        @${importFrom}.Field(type => Boolean)
        mandatoryBool!: Scalars['Boolean'];

        @${importFrom}.Field(type => ${importFrom}.Int, { nullable: true })
        int?: Maybe<Scalars['Int']>;

        @${importFrom}.Field(type => ${importFrom}.Int)
        mandatoryInt!: Scalars['Int'];

        @${importFrom}.Field(type => ${importFrom}.Float, { nullable: true })
        float?: Maybe<Scalars['Float']>;

        @${importFrom}.Field(type => ${importFrom}.Float)
        mandatoryFloat!: Scalars['Float'];

        @${importFrom}.Field(type => B, { nullable: true })
        b?: Maybe<B>;

        @${importFrom}.Field(type => B)
        mandatoryB!: FixDecorator<B>;

        @${importFrom}.Field(type => [String], { nullable: true })
        arr?: Maybe<Array<Scalars['String']>>;

        @${importFrom}.Field(type => [String])
        mandatoryArr!: Array<Scalars['String']>;
      }
    `);
  });

  it('should generate types as custom types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Test {
        id: ID
        mandatoryStr: String!
      }
      interface ITest {
        id: ID
      }
    `);

    const result = (await plugin(
      schema,
      [],
      { decoratorName: { type: 'Foo', field: 'Bar', interface: 'FooBar' }, ...(config || {}) },
      { outputFile: '' },
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
        @${importFrom}.Foo()
        export class Test {
          __typename?: 'Test';
          @${importFrom}.Bar(type => ${importFrom}.ID, { nullable: true })
          id?: Maybe<Scalars['ID']>;
          @${importFrom}.Bar(type => String)
          mandatoryStr!: Scalars['String'];
        }
      `);
    expect(result.content).toBeSimilarStringTo(`
        @${importFrom}.FooBar()
        export abstract class ITest {

          @${importFrom}.Bar(type => ${importFrom}.ID, { nullable: true })
          id?: Maybe<Scalars['ID']>;
        }
      `);
  });

  it('should generate custom scalar types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      scalar DateTime

      type A {
        date: DateTime
        mandatoryDate: DateTime!
      }
    `);

    const result = (await plugin(
      schema,
      [],
      { scalars: { DateTime: 'Date' }, ...(config || {}) },
      { outputFile: '' },
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.ObjectType()
      export class A {
        __typename?: 'A';
        @${importFrom}.Field(type => Date, { nullable: true })
        date?: Maybe<Scalars['DateTime']>;
        @${importFrom}.Field(type => Date)
        mandatoryDate!: Scalars['DateTime'];
      }
    `);
  });

  it('should correctly set options for nullable types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type MyType {
        str1: String
        str2: String!
        strArr1: [String]
        strArr2: [String]!
        strArr3: [String!]
        strArr4: [String!]!

        int1: Int
        int2: Int!
        intArr1: [Int]
        intArr2: [Int]!
        intArr3: [Int!]
        intArr4: [Int!]!

        custom1: MyType2
        custom2: MyType2!
        customArr1: [MyType2]
        customArr2: [MyType2]!
        customArr3: [MyType2!]
        customArr4: [MyType2!]!
      }

      input MyInputType {
        inputStr1: String
        inputStr2: String!
        inputStrArr1: [String]
        inputStrArr2: [String]!
        inputStrArr3: [String!]
        inputStrArr4: [String!]!

        inputInt1: Int
        inputInt2: Int!
        inputIntArr1: [Int]
        inputIntArr2: [Int]!
        inputIntArr3: [Int!]
        inputIntArr4: [Int!]!

        inputCustom1: MyType2
        inputCustom2: MyType2!
        inputCustomArr1: [MyType2]
        inputCustomArr2: [MyType2]!
        inputCustomArr3: [MyType2!]
        inputCustomArr4: [MyType2!]!
      }

      type MyType2 {
        id: ID!
      }
    `);

    const result = await plugin(schema, [], config || {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => String, { nullable: true })
      str1?: Maybe<Scalars['String']>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => String)
      str2!: Scalars['String'];
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => [String], { nullable: 'itemsAndList' })
      strArr1?: Maybe<Array<Maybe<Scalars['String']>>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => [String], { nullable: 'items' })
      strArr2!: Array<Maybe<Scalars['String']>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => [String], { nullable: true })
      strArr3?: Maybe<Array<Scalars['String']>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => [String])
      strArr4!: Array<Scalars['String']>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => ${importFrom}.Int, { nullable: true })
      int1?: Maybe<Scalars['Int']>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => ${importFrom}.Int)
      int2!: Scalars['Int'];
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => [${importFrom}.Int], { nullable: 'itemsAndList' })
      intArr1?: Maybe<Array<Maybe<Scalars['Int']>>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => [${importFrom}.Int], { nullable: 'items' })
      intArr2!: Array<Maybe<Scalars['Int']>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => [${importFrom}.Int], { nullable: true })
      intArr3?: Maybe<Array<Scalars['Int']>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => [${importFrom}.Int])
      intArr4!: Array<Scalars['Int']>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => MyType2, { nullable: true })
      custom1?: Maybe<MyType2>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => MyType2)
      custom2!: FixDecorator<MyType2>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => [MyType2], { nullable: 'itemsAndList' })
      customArr1?: Maybe<Array<Maybe<MyType2>>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => [MyType2], { nullable: 'items' })
      customArr2!: Array<Maybe<MyType2>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => [MyType2], { nullable: true })
      customArr3?: Maybe<Array<MyType2>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => [MyType2])
      customArr4!: Array<MyType2>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => String, { nullable: true })
      inputStr1?: Maybe<Scalars['String']>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => String)
      inputStr2!: Scalars['String'];
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => [String], { nullable: 'itemsAndList' })
      inputStrArr1?: Maybe<Array<Maybe<Scalars['String']>>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => [String], { nullable: 'items' })
      inputStrArr2!: Array<Maybe<Scalars['String']>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => [String], { nullable: true })
      inputStrArr3?: Maybe<Array<Scalars['String']>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => [String])
      inputStrArr4!: Array<Scalars['String']>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => ${importFrom}.Int, { nullable: true })
      inputInt1?: Maybe<Scalars['Int']>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => ${importFrom}.Int)
      inputInt2!: Scalars['Int'];
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => [${importFrom}.Int], { nullable: 'itemsAndList' })
      inputIntArr1?: Maybe<Array<Maybe<Scalars['Int']>>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => [${importFrom}.Int], { nullable: 'items' })
      inputIntArr2!: Array<Maybe<Scalars['Int']>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => [${importFrom}.Int], { nullable: true })
      inputIntArr3?: Maybe<Array<Scalars['Int']>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => [${importFrom}.Int])
      inputIntArr4!: Array<Scalars['Int']>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => MyType2, { nullable: true })
      inputCustom1?: Maybe<MyType2>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => MyType2)
      inputCustom2!: FixDecorator<MyType2>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => [MyType2], { nullable: 'itemsAndList' })
      inputCustomArr1?: Maybe<Array<Maybe<MyType2>>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => [MyType2], { nullable: 'items' })
      inputCustomArr2!: Array<Maybe<MyType2>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => [MyType2], { nullable: true })
      inputCustomArr3?: Maybe<Array<MyType2>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.Field(type => [MyType2])
      inputCustomArr4!: Array<MyType2>;
    `);
  });

  it('should put the GraphQL description in the options', async () => {
    const schema = buildSchema(/* GraphQL */ `
      """
      Test type description
      """
      type Test implements ITest {
        """
        id field description
        inside Test class
        """
        id: ID

        """
        mandatoryStr field description
        """
        mandatoryStr: String!
      }

      """
      ITest interface description
      """
      interface ITest {
        """
        id field description
        inside ITest interface
        """
        id: ID
      }

      """
      TestInput input description
      """
      input TestInput {
        id: ID
      }
    `);

    const result = await plugin(schema, [], config || {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.ObjectType({ description: 'Test type description', implements: ITest })
      export class Test extends ITest {
        __typename?: 'Test';
        @${importFrom}.Field(type => ${importFrom}.ID, { description: 'id field description\\ninside Test class', nullable: true })
        id?: Maybe<Scalars['ID']>;
        @${importFrom}.Field(type => String, { description: 'mandatoryStr field description' })
        mandatoryStr!: Scalars['String'];
      }
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.InterfaceType({ description: 'ITest interface description' })
      export abstract class ITest {

        @${importFrom}.Field(type => ${importFrom}.ID, { description: 'id field description\\ninside ITest interface', nullable: true })
        id?: Maybe<Scalars['ID']>;
      }
    `);

    expect(result.content).toBeSimilarStringTo(`
      @${importFrom}.InputType({ description: 'TestInput input description' })
      export class TestInput {

        @${importFrom}.Field(type => ${importFrom}.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;
      }
    `);
  });

  it('should only generate decorators for included types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      enum RegularEnum {
        A
        B
      }

      enum TypeGraphQLEnum {
        A
        B
      }

      interface IRegularInterfaceType {
        id: ID
      }

      interface ITypeGraphQLInterfaceType {
        id: ID
      }

      type RegularType {
        id: ID
      }

      type TypeGraphQLType {
        id: ID
      }

      input RegularInputType {
        id: ID
      }

      input TypeGraphQLInputType {
        id: ID
      }

      type Query {
        regularFunction(mandatoryId: ID!, optionalId: ID): Boolean!
        typeGraphQLFunction(mandatoryId: ID!, optionalId: ID): Boolean!
      }
    `);

    const result = await plugin(
      schema,
      [],
      {
        decorateTypes: [
          'TypeGraphQLEnum',
          'ITypeGraphQLInterfaceType',
          'TypeGraphQLType',
          'TypeGraphQLInputType',
          'QueryTypeGraphQlFunctionArgs',
        ],
        ...(config || {}),
      },
      { outputFile: '' },
    );

    expect(result.content).not.toBeSimilarStringTo(
      `${importFrom}.registerEnumType(RegularEnum, { name: 'RegularEnum' });`,
    );

    expect(result.content).toBeSimilarStringTo(
      `${importFrom}.registerEnumType(TypeGraphQlEnum, { name: 'TypeGraphQlEnum' });`,
    );

    expect(result.content).toBeSimilarStringTo(
      `export type IRegularInterfaceType = {
        id?: Maybe<Scalars['ID']>;
      };`,
    );

    expect(result.content).toBeSimilarStringTo(
      `
      @${importFrom}.InterfaceType()
      export abstract class ITypeGraphQlInterfaceType {
        @${importFrom}.Field(type => ${importFrom}.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;
      }`,
    );

    expect(result.content).toBeSimilarStringTo(
      `export type RegularType = {
        __typename?: 'RegularType';
        id?: Maybe<Scalars['ID']>;
      };`,
    );

    expect(result.content).toBeSimilarStringTo(
      `@${importFrom}.ObjectType()
      export class TypeGraphQlType {
        __typename?: 'TypeGraphQLType';
        @${importFrom}.Field(type => ${importFrom}.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;
      }`,
    );

    expect(result.content).toBeSimilarStringTo(
      `export type RegularInputType = {
        id?: Maybe<Scalars['ID']>;
      };`,
    );

    expect(result.content).toBeSimilarStringTo(
      `@${importFrom}.InputType()
      export class TypeGraphQlInputType {
        @${importFrom}.Field(type => ${importFrom}.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;
      }`,
    );

    expect(result.content).toBeSimilarStringTo(`
    export type Query = {
      __typename?: 'Query';
      regularFunction: Scalars['Boolean'];
      typeGraphQLFunction: Scalars['Boolean'];
    };`);

    expect(result.content).toBeSimilarStringTo(`export type QueryRegularFunctionArgs = {
        mandatoryId: Scalars['ID'];
        optionalId?: InputMaybe<Scalars['ID']>;
      };`);

    expect(result.content).toBeSimilarStringTo(` @${importFrom}.ArgsType()
       export class QueryTypeGraphQlFunctionArgs {

         @${importFrom}.Field(type => ${importFrom}.ID)
         mandatoryId!: Scalars['ID'];

         @${importFrom}.Field(type => ${importFrom}.ID, { nullable: true })
         optionalId?: Maybe<Scalars['ID']>;
       };`);
  });
});
