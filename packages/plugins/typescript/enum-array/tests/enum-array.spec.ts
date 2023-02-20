import { buildSchema } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';
import '@graphql-codegen/testing';
import { plugin } from '../src/index.js';

describe('TypeScript', () => {
  describe('with importFrom', () => {
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

      expect(result.prepend).toBeSimilarStringTo(`
      `);
      expect(result.content).toBeSimilarStringTo(`
        const MY_ENUM: MyEnum[] = ['A', 'B'];
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

      expect(result.prepend).toBeSimilarStringTo(`
      `);
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

      expect(result.prepend).toBeSimilarStringTo(`
      `);
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

      expect(result.prepend).toBeSimilarStringTo(`
      `);
      expect(result.content).toBeSimilarStringTo(`
        const MY_ENUM: my_enum[] = [my_enum.abc_def, my_enum.ghi_jkl];
      `);
    });
  });
});
