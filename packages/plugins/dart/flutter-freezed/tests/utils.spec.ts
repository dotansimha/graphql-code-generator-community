import { transformSchemaAST } from '@graphql-codegen/schema-ast';
import { unionSchema } from './schema';
import { appliesOnBlock, arrayWrap, dartCasing, nodeIsObjectType } from '../src/utils';
import { defaultFreezedPluginConfig, APPLIES_ON_PARAMETERS } from '../src/config/plugin-config';

const {
  ast: { definitions: nodes },
} = transformSchemaAST(unionSchema, defaultFreezedPluginConfig);

describe('arrayWrap:', () => {
  it('wraps the value in array if the value is not an array', () => {
    expect(arrayWrap('Hello')).toMatchObject(['Hello']);
  });

  it('returns the value if the value is already an array', () => {
    expect(arrayWrap(['Hello'])).toMatchObject(['Hello']);
  });

  it('returns an empty array `[]` if the value is undefined', () => {
    expect(arrayWrap(undefined)).toMatchObject([]);
  });
});

test('method: nodeIsObjectType() => returns true if node is an ObjectType', () => {
  const expected = [false, true, true, false, true, true, false];
  expect(nodes.map(nodeIsObjectType)).toEqual(expected);
});

test('method: appliesOnBlock() => returns true if the configAppliesOnBlock contains some of the blockAppliesOn values', () => {
  expect(appliesOnBlock(['parameter'], APPLIES_ON_PARAMETERS)).toBe(true);
  expect(appliesOnBlock(['factory', 'parameter'], ['parameter'])).toBe(true);
  expect(appliesOnBlock(['default_factory_parameter', 'parameter'], ['union_factory_parameter'])).toBe(false);
});

test('method: dartCasing() => ', () => {
  expect(dartCasing('snake---- Case___ ME', 'snake_case')).toBe('snake_case_me');
  expect(dartCasing('Camel_ case- -- - ME', 'camelCase')).toBe('camelCaseMe');
  expect(dartCasing('pascal-- --case _ ME', 'PascalCase')).toBe('PascalCaseMe');
  expect(dartCasing('lE-AvE mE A-l_o_n-e')).toBe('lE-AvE mE A-l_o_n-e');
});
