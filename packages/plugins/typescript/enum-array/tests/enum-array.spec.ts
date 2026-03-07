import { buildClientSchema, buildSchema } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';
import '@graphql-codegen/testing';
import { plugin } from '../src/index.js';

describe('TypeScript', () => {
  describe('with importFrom', () => {
    it('Should work with schema', async () => {
      const schema = buildSchema(/* GraphQL */ `
        "custom enum"
        enum MyEnum {
          "this is a"
          A
          "this is b"
          B
        }
      `);
      const result = (await plugin(schema, [], {
        importFrom: './generated-types',
      })) as Types.ComplexPluginOutput;

      expect(result.prepend).toBeSimilarStringTo(`
        import { MyEnum } from "./generated-types";
      `);
      expect(result.content).toBeSimilarStringTo(`
        const MY_ENUM: MyEnum[] = ['A', 'B'];
      `);
    });

    it('Should work with introspection', async () => {
      const schema = buildClientSchema(require('../../../../../dev-test/githunt/schema.json'));

      const result = (await plugin(schema, [], {
        importFrom: './generated-types',
      })) as Types.ComplexPluginOutput;

      expect(result.prepend).toBeSimilarStringTo(`
       import { FeedType, VoteType } from "./generated-types";
      `);
      expect(result.content).toBeSimilarStringTo(`
       export const FEED_TYPE: FeedType[] = ['HOT', 'NEW', 'TOP'];
       export const VOTE_TYPE: VoteType[] = ['UP', 'DOWN', 'CANCEL'];
      `);
    });
  });

  describe('without importFrom', () => {
    it('Should work', async () => {
      const schema = buildSchema(/* GraphQL */ `
        "custom enum"
        enum MyEnum {
          "this is a"
          A
          "this is b"
          B
        }
      `);
      const result = (await plugin(schema, [], {})) as Types.ComplexPluginOutput;

      expect(result.prepend).toBeSimilarStringTo(``);
      expect(result.content).toBeSimilarStringTo(`
        const MY_ENUM: MyEnum[] = ['A', 'B'];
      `);
    });

    it('Should work with introspection', async () => {
      const schema = buildClientSchema(require('../../../../../dev-test/githunt/schema.json'));

      const result = (await plugin(schema, [], {})) as Types.ComplexPluginOutput;

      expect(result.prepend).toBeSimilarStringTo(``);
      expect(result.content).toBeSimilarStringTo(`
       export const FEED_TYPE: FeedType[] = ['HOT', 'NEW', 'TOP'];
       export const VOTE_TYPE: VoteType[] = ['UP', 'DOWN', 'CANCEL'];
      `);
    });
  });

  describe('with constArrays', () => {
    it('Should work', async () => {
      const schema = buildSchema(/* GraphQL */ `
        "custom enum"
        enum MyEnum {
          "this is a"
          A
          "this is b"
          B
        }
      `);
      const result = (await plugin(schema, [], { constArrays: true })) as Types.ComplexPluginOutput;

      expect(result.prepend).toBeSimilarStringTo(``);
      expect(result.content).toBeSimilarStringTo(`
        const MY_ENUM = ['A', 'B'] as const;
      `);
    });
  });

  describe('with useMembers', () => {
    it('Should work', async () => {
      const schema = buildSchema(/* GraphQL */ `
        "custom enum"
        enum MyEnum {
          "this is abc_def"
          abc_def
          "this is ghi_jkl"
          ghi_jkl
        }
      `);
      const result = (await plugin(schema, [], { useMembers: true })) as Types.ComplexPluginOutput;

      expect(result.prepend).toBeSimilarStringTo(``);
      expect(result.content).toBeSimilarStringTo(`
        const MY_ENUM: MyEnum[] = [MyEnum.AbcDef, MyEnum.GhiJkl];
      `);
    });

    it('respects namingConvention', async () => {
      const schema = buildSchema(/* GraphQL */ `
        "custom enum"
        enum MyEnum {
          "this is abc_def"
          abc_def
          "this is ghi_jkl"
          ghi_jkl
        }
      `);
      const result = (await plugin(schema, [], {
        useMembers: true,
        namingConvention: 'change-case-all#snakeCase',
      })) as Types.ComplexPluginOutput;

      expect(result.prepend).toBeSimilarStringTo(``);
      expect(result.content).toBeSimilarStringTo(`
        const MY_ENUM: my_enum[] = [my_enum.abc_def, my_enum.ghi_jkl];
      `);
    });
  });

  describe('with asNonEmptyTuple', () => {
    it('Should declare the array as a non-empty tuple', async () => {
      const schema = buildSchema(/* GraphQL */ `
        "custom enum"
        enum MyEnum {
          "this is a"
          A
          "this is b"
          B
        }
      `);
      const result = (await plugin(schema, [], {
        asNonEmptyTuple: true,
      })) as Types.ComplexPluginOutput;

      expect(result.prepend).toBeSimilarStringTo(``);
      expect(result.content).toBeSimilarStringTo(`
        export const MY_ENUM: [MyEnum, ...MyEnum[]] = ['A', 'B'];
      `);
    });

    it('Should be ignored when constArrays is true', async () => {
      const schema = buildSchema(/* GraphQL */ `
        "custom enum"
        enum MyEnum {
          "this is a"
          A
          "this is b"
          B
        }
      `);
      const result = (await plugin(schema, [], {
        asNonEmptyTuple: true,
        constArrays: true,
      })) as Types.ComplexPluginOutput;

      expect(result.prepend).toBeSimilarStringTo(``);
      expect(result.content).toBeSimilarStringTo(`
        export const MY_ENUM = ['A', 'B'] as const;
      `);
    });
  });
});
