import { describe, expect, it } from 'vitest';
import {
  constantCase,
  isReservedField,
  isValidClassAttr,
  pascalCase,
  PY_IDENT_RE,
  PYTHON_KEYWORDS,
  PYTHON_SCALARS,
  pythonFieldName,
} from '../src/index.js';

describe('@graphql-codegen/python-common', () => {
  describe('PYTHON_KEYWORDS', () => {
    it('contains hard keywords', () => {
      expect(PYTHON_KEYWORDS.has('class')).toBe(true);
      expect(PYTHON_KEYWORDS.has('from')).toBe(true);
      expect(PYTHON_KEYWORDS.has('import')).toBe(true);
    });

    it('contains the soft keywords match/case', () => {
      expect(PYTHON_KEYWORDS.has('match')).toBe(true);
      expect(PYTHON_KEYWORDS.has('case')).toBe(true);
    });

    it('does not flag ordinary identifiers', () => {
      expect(PYTHON_KEYWORDS.has('id')).toBe(false);
      expect(PYTHON_KEYWORDS.has('name')).toBe(false);
    });
  });

  describe('PY_IDENT_RE / isValidClassAttr', () => {
    it('accepts valid identifiers that are not keywords', () => {
      expect(PY_IDENT_RE.test('user_id')).toBe(true);
      expect(isValidClassAttr('user_id')).toBe(true);
    });

    it('rejects reserved keywords even though they match the identifier regex', () => {
      expect(PY_IDENT_RE.test('class')).toBe(true);
      expect(isValidClassAttr('class')).toBe(false);
    });

    it('rejects non-identifier strings', () => {
      expect(isValidClassAttr('2fast')).toBe(false);
      expect(isValidClassAttr('my-field')).toBe(false);
    });
  });

  describe('PYTHON_SCALARS', () => {
    it('maps built-in GraphQL scalars to native Python types', () => {
      expect(PYTHON_SCALARS.ID).toEqual({ input: 'str', output: 'str' });
      expect(PYTHON_SCALARS.Int).toEqual({ input: 'int', output: 'int' });
      expect(PYTHON_SCALARS.Float).toEqual({ input: 'float', output: 'float' });
      expect(PYTHON_SCALARS.Boolean).toEqual({ input: 'bool', output: 'bool' });
    });
  });

  describe('pythonFieldName', () => {
    it('converts camelCase to snake_case', () => {
      expect(pythonFieldName('createdAt')).toBe('created_at');
      expect(pythonFieldName('firstName')).toBe('first_name');
    });

    it('splits acronym runs the same way change-case pascalCase does', () => {
      expect(pythonFieldName('GetHTTPStatus')).toBe('get_http_status');
      expect(pythonFieldName('httpURL')).toBe('http_url');
      expect(pythonFieldName('ABTest')).toBe('ab_test');
    });

    it('escapes reserved keywords with a trailing underscore', () => {
      expect(pythonFieldName('from')).toBe('from_');
      expect(pythonFieldName('class')).toBe('class_');
    });

    it('leaves non-keyword snake_case names untouched', () => {
      expect(pythonFieldName('user_id')).toBe('user_id');
    });
  });

  describe('isReservedField', () => {
    it('is true when the snake_cased name is a reserved keyword', () => {
      expect(isReservedField('from')).toBe(true);
      expect(isReservedField('Class')).toBe(true); // snake_cases to "class"
    });

    it('is false when the snake_cased name merely contains a keyword as a substring', () => {
      expect(isReservedField('className')).toBe(false); // snake_cases to "class_name"
    });

    it('is false for ordinary field names', () => {
      expect(isReservedField('createdAt')).toBe(false);
    });
  });

  describe('pascalCase', () => {
    it('PascalCases names for class / result types', () => {
      expect(pascalCase('getUsers')).toBe('GetUsers');
      expect(pascalCase('get_users')).toBe('GetUsers');
    });

    it('lowercases acronym runs so class names line up with BaseVisitor.convertName', () => {
      expect(pascalCase('GetHTTPStatus')).toBe('GetHttpStatus');
      expect(pascalCase('httpURL')).toBe('HttpUrl');
    });
  });

  describe('constantCase', () => {
    it('CONSTANT_CASEs names for document constants', () => {
      expect(constantCase('getUsers')).toBe('GET_USERS');
      expect(constantCase('GetHTTPStatus')).toBe('GET_HTTP_STATUS');
    });
  });
});
