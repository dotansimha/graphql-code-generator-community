import { buildSchema } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';
import '@graphql-codegen/testing';
import { plugin } from '../src/index';

describe('nest', () => {
  it('should expose Maybe', async () => {
    const schema = buildSchema(/* GraphQL */ `
      scalar A
    `);
    const result = await plugin(schema, [], {}, { outputFile: '' });
    expect(result.prepend).toBeSimilarStringTo('export type Maybe<T> =');
  });

  it('should expose Exact', async () => {
    const schema = buildSchema(/* GraphQL */ `
      scalar A
    `);
    const result = await plugin(schema, [], {}, { outputFile: '' });
    expect(result.prepend).toBeSimilarStringTo('export type Exact<');
  });

  it('should expose FixDecorator', async () => {
    const schema = buildSchema(/* GraphQL */ `
      scalar A
    `);
    const result = await plugin(schema, [], {}, { outputFile: '' });
    expect(result.prepend).toBeSimilarStringTo('export type FixDecorator<T> = T;');
  });

  it('should generate Nest import/export', async () => {
    const schema = buildSchema(/* GraphQL */ `
      scalar A
    `);
    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result.prepend).toBeSimilarStringTo(`import * as Nest from '@nestjs/graphql';
    export { Nest };`);
  });

  it('should generate Nest enums', async () => {
    const schema = buildSchema(/* GraphQL */ `
      "custom enum"
      enum MyEnum {
        "this is a"
        A
        "this is b"
        B
      }
    `);
    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      /** custom enum */
      export enum MyEnum {
        /** this is a */
        A = 'A',
        /** this is b */
        B = 'B'
      }
      Nest.registerEnumType(MyEnum, { name: 'MyEnum' });`);
  });

  it('should generate Nest classes for object types', async () => {
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

    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      @Nest.ObjectType()
      export class A {
        __typename?: 'A';
        @Nest.Field(type => Nest.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;
        @Nest.Field(type => Nest.ID)
        mandatoryId!: Scalars['ID'];
        @Nest.Field(type => String, { nullable: true })
        str?: Maybe<Scalars['String']>;
        @Nest.Field(type => String)
        mandatoryStr!: Scalars['String'];
        @Nest.Field(type => Boolean, { nullable: true })
        bool?: Maybe<Scalars['Boolean']>;
        @Nest.Field(type => Boolean)
        mandatoryBool!: Scalars['Boolean'];
        @Nest.Field(type => Nest.Int, { nullable: true })
        int?: Maybe<Scalars['Int']>;
        @Nest.Field(type => Nest.Int)
        mandatoryInt!: Scalars['Int'];
        @Nest.Field(type => Nest.Float, { nullable: true })
        float?: Maybe<Scalars['Float']>;
        @Nest.Field(type => Nest.Float)
        mandatoryFloat!: Scalars['Float'];
        @Nest.Field(type => B, { nullable: true })
        b?: Maybe<B>;
        @Nest.Field(type => B)
        mandatoryB!: FixDecorator<B>;
        @Nest.Field(type => [String], { nullable: true })
        arr?: Maybe<Array<Scalars['String']>>;
        @Nest.Field(type => [String])
        mandatoryArr!: Array<Scalars['String']>;
      }
    `);
  });

  it('should generate Nest classes implementing Nest interfaces for object types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Test implements ITest {
        id: ID
        mandatoryStr: String!
      }
      interface ITest {
        id: ID
      }
    `);

    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      @Nest.ObjectType({ implements: ITest })
      export class Test extends ITest {
        __typename?: 'Test';
        @Nest.Field(type => Nest.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;
        @Nest.Field(type => String)
        mandatoryStr!: Scalars['String'];
      }
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.InterfaceType()
      export abstract class ITest {

        @Nest.Field(type => Nest.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;
      }
    `);
  });

  it('should generate Nest classes for input types', async () => {
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

    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      @Nest.InputType()
      export class A {

        @Nest.Field(type => Nest.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;

        @Nest.Field(type => Nest.ID)
        mandatoryId!: Scalars['ID'];

        @Nest.Field(type => String, { nullable: true })
        str?: Maybe<Scalars['String']>;

        @Nest.Field(type => String)
        mandatoryStr!: Scalars['String'];

        @Nest.Field(type => Boolean, { nullable: true })
        bool?: Maybe<Scalars['Boolean']>;

        @Nest.Field(type => Boolean)
        mandatoryBool!: Scalars['Boolean'];

        @Nest.Field(type => Nest.Int, { nullable: true })
        int?: Maybe<Scalars['Int']>;

        @Nest.Field(type => Nest.Int)
        mandatoryInt!: Scalars['Int'];

        @Nest.Field(type => Nest.Float, { nullable: true })
        float?: Maybe<Scalars['Float']>;

        @Nest.Field(type => Nest.Float)
        mandatoryFloat!: Scalars['Float'];

        @Nest.Field(type => B, { nullable: true })
        b?: Maybe<B>;

        @Nest.Field(type => B)
        mandatoryB!: FixDecorator<B>;

        @Nest.Field(type => [String], { nullable: true })
        arr?: Maybe<Array<Scalars['String']>>;

        @Nest.Field(type => [String])
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

    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      @Nest.ArgsType()
      export class MutationTestArgs {

        @Nest.Field(type => Nest.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;

        @Nest.Field(type => Nest.ID)
        mandatoryId!: Scalars['ID'];

        @Nest.Field(type => String, { nullable: true })
        str?: Maybe<Scalars['String']>;

        @Nest.Field(type => String)
        mandatoryStr!: Scalars['String'];

        @Nest.Field(type => Boolean, { nullable: true })
        bool?: Maybe<Scalars['Boolean']>;

        @Nest.Field(type => Boolean)
        mandatoryBool!: Scalars['Boolean'];

        @Nest.Field(type => Nest.Int, { nullable: true })
        int?: Maybe<Scalars['Int']>;

        @Nest.Field(type => Nest.Int)
        mandatoryInt!: Scalars['Int'];

        @Nest.Field(type => Nest.Float, { nullable: true })
        float?: Maybe<Scalars['Float']>;

        @Nest.Field(type => Nest.Float)
        mandatoryFloat!: Scalars['Float'];

        @Nest.Field(type => B, { nullable: true })
        b?: Maybe<B>;

        @Nest.Field(type => B)
        mandatoryB!: FixDecorator<B>;

        @Nest.Field(type => [String], { nullable: true })
        arr?: Maybe<Array<Scalars['String']>>;

        @Nest.Field(type => [String])
        mandatoryArr!: Array<Scalars['String']>;
      }
    `);
  });

  it('should generate Nest types as custom types', async () => {
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
      { decoratorName: { type: 'Foo', field: 'Bar', interface: 'FooBar' } },
      { outputFile: '' },
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
        @Nest.Foo()
        export class Test {
          __typename?: 'Test';
          @Nest.Bar(type => Nest.ID, { nullable: true })
          id?: Maybe<Scalars['ID']>;
          @Nest.Bar(type => String)
          mandatoryStr!: Scalars['String'];
        }
      `);
    expect(result.content).toBeSimilarStringTo(`
        @Nest.FooBar()
        export abstract class ITest {

          @Nest.Bar(type => Nest.ID, { nullable: true })
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
      { scalars: { DateTime: 'Date' } },
      { outputFile: '' },
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      @Nest.ObjectType()
      export class A {
        __typename?: 'A';
        @Nest.Field(type => Date, { nullable: true })
        date?: Maybe<Scalars['DateTime']>;
        @Nest.Field(type => Date)
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

    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => String, { nullable: true })
      str1?: Maybe<Scalars['String']>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => String)
      str2!: Scalars['String'];
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => [String], { nullable: 'itemsAndList' })
      strArr1?: Maybe<Array<Maybe<Scalars['String']>>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => [String], { nullable: 'items' })
      strArr2!: Array<Maybe<Scalars['String']>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => [String], { nullable: true })
      strArr3?: Maybe<Array<Scalars['String']>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => [String])
      strArr4!: Array<Scalars['String']>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => Nest.Int, { nullable: true })
      int1?: Maybe<Scalars['Int']>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => Nest.Int)
      int2!: Scalars['Int'];
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => [Nest.Int], { nullable: 'itemsAndList' })
      intArr1?: Maybe<Array<Maybe<Scalars['Int']>>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => [Nest.Int], { nullable: 'items' })
      intArr2!: Array<Maybe<Scalars['Int']>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => [Nest.Int], { nullable: true })
      intArr3?: Maybe<Array<Scalars['Int']>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => [Nest.Int])
      intArr4!: Array<Scalars['Int']>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => MyType2, { nullable: true })
      custom1?: Maybe<MyType2>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => MyType2)
      custom2!: FixDecorator<MyType2>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => [MyType2], { nullable: 'itemsAndList' })
      customArr1?: Maybe<Array<Maybe<MyType2>>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => [MyType2], { nullable: 'items' })
      customArr2!: Array<Maybe<MyType2>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => [MyType2], { nullable: true })
      customArr3?: Maybe<Array<MyType2>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => [MyType2])
      customArr4!: Array<MyType2>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => String, { nullable: true })
      inputStr1?: Maybe<Scalars['String']>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => String)
      inputStr2!: Scalars['String'];
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => [String], { nullable: 'itemsAndList' })
      inputStrArr1?: Maybe<Array<Maybe<Scalars['String']>>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => [String], { nullable: 'items' })
      inputStrArr2!: Array<Maybe<Scalars['String']>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => [String], { nullable: true })
      inputStrArr3?: Maybe<Array<Scalars['String']>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => [String])
      inputStrArr4!: Array<Scalars['String']>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => Nest.Int, { nullable: true })
      inputInt1?: Maybe<Scalars['Int']>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => Nest.Int)
      inputInt2!: Scalars['Int'];
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => [Nest.Int], { nullable: 'itemsAndList' })
      inputIntArr1?: Maybe<Array<Maybe<Scalars['Int']>>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => [Nest.Int], { nullable: 'items' })
      inputIntArr2!: Array<Maybe<Scalars['Int']>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => [Nest.Int], { nullable: true })
      inputIntArr3?: Maybe<Array<Scalars['Int']>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => [Nest.Int])
      inputIntArr4!: Array<Scalars['Int']>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => MyType2, { nullable: true })
      inputCustom1?: Maybe<MyType2>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => MyType2)
      inputCustom2!: FixDecorator<MyType2>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => [MyType2], { nullable: 'itemsAndList' })
      inputCustomArr1?: Maybe<Array<Maybe<MyType2>>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => [MyType2], { nullable: 'items' })
      inputCustomArr2!: Array<Maybe<MyType2>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => [MyType2], { nullable: true })
      inputCustomArr3?: Maybe<Array<MyType2>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.Field(type => [MyType2])
      inputCustomArr4!: Array<MyType2>;
    `);
  });

  it('should put the GraphQL description in the Nest options', async () => {
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

    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      @Nest.ObjectType({ description: 'Test type description', implements: ITest })
      export class Test extends ITest {
        __typename?: 'Test';
        @Nest.Field(type => Nest.ID, { description: 'id field description\\ninside Test class', nullable: true })
        id?: Maybe<Scalars['ID']>;
        @Nest.Field(type => String, { description: 'mandatoryStr field description' })
        mandatoryStr!: Scalars['String'];
      }
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.InterfaceType({ description: 'ITest interface description' })
      export abstract class ITest {

        @Nest.Field(type => Nest.ID, { description: 'id field description\\ninside ITest interface', nullable: true })
        id?: Maybe<Scalars['ID']>;
      }
    `);

    expect(result.content).toBeSimilarStringTo(`
      @Nest.InputType({ description: 'TestInput input description' })
      export class TestInput {

        @Nest.Field(type => Nest.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;
      }
    `);
  });

  it('should only generate Nest decorators for included types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      enum RegularEnum {
        A
        B
      }

      enum NestEnum {
        A
        B
      }

      interface IRegularInterfaceType {
        id: ID
      }

      interface INestInterfaceType {
        id: ID
      }

      type RegularType {
        id: ID
      }

      type NestType {
        id: ID
      }

      input RegularInputType {
        id: ID
      }

      input NestInputType {
        id: ID
      }

      type Query {
        regularFunction(mandatoryId: ID!, optionalId: ID): Boolean!
        NestFunction(mandatoryId: ID!, optionalId: ID): Boolean!
      }
    `);

    const result = await plugin(
      schema,
      [],
      {
        decorateTypes: [
          'NestEnum',
          'INestInterfaceType',
          'NestType',
          'NestInputType',
          'QueryNestFunctionArgs',
        ],
      },
      { outputFile: '' },
    );

    expect(result.content).not.toBeSimilarStringTo(
      `Nest.registerEnumType(RegularEnum, { name: 'RegularEnum' });`,
    );

    expect(result.content).toBeSimilarStringTo(
      `Nest.registerEnumType(NestEnum, { name: 'NestEnum' });`,
    );

    expect(result.content).toBeSimilarStringTo(
      `export type IRegularInterfaceType = {
        id?: Maybe<Scalars['ID']>;
      };`,
    );

    expect(result.content).toBeSimilarStringTo(
      `
      @Nest.InterfaceType()
      export abstract class INestInterfaceType {
        @Nest.Field(type => Nest.ID, { nullable: true })
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
      `@Nest.ObjectType()
      export class NestType {
        __typename?: 'NestType';
        @Nest.Field(type => Nest.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;
      }`,
    );

    expect(result.content).toBeSimilarStringTo(
      `export type RegularInputType = {
        id?: Maybe<Scalars['ID']>;
      };`,
    );

    expect(result.content).toBeSimilarStringTo(
      `@Nest.InputType()
      export class NestInputType {
        @Nest.Field(type => Nest.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;
      }`,
    );

    expect(result.content).toBeSimilarStringTo(`
    export type Query = {
      __typename?: 'Query';
      regularFunction: Scalars['Boolean'];
      NestFunction: Scalars['Boolean'];
    };`);

    expect(result.content).toBeSimilarStringTo(`export type QueryRegularFunctionArgs = {
        mandatoryId: Scalars['ID'];
        optionalId?: InputMaybe<Scalars['ID']>;
      };`);

    expect(result.content).toBeSimilarStringTo(` @Nest.ArgsType()
       export class QueryNestFunctionArgs {

         @Nest.Field(type => Nest.ID)
         mandatoryId!: Scalars['ID'];

         @Nest.Field(type => Nest.ID, { nullable: true })
         optionalId?: Maybe<Scalars['ID']>;
       };`);
  });

  it('correctly generates descriptions for partially annotated arguments', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        query(
          """
          Mandatory id description
          """
          mandatoryId: ID!
          optionalId: ID
        ): Boolean!
      }
    `);

    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(` @Nest.ArgsType()
       export class QueryQueryArgs {

         @Nest.Field(type => Nest.ID, { description: 'Mandatory id description' })
         mandatoryId!: Scalars['ID'];

         @Nest.Field(type => Nest.ID, { nullable: true })
         optionalId?: Maybe<Scalars['ID']>;
       };`);
  });
});
