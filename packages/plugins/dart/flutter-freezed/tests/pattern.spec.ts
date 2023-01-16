import { TypeName, FieldName, TypeNamePattern, FieldNamePattern, Pattern } from '../src/config/pattern.js';

//#region helper functions

//#region arrayIndexed(...)
/**
 * helper function that indexes the array passed to `.each `method of `describe`, `test` and `it`
 * @param arr The array of tuples to be indexed
 * @returns array of tuples where the first element in the tuple is the index of the tuple
 */
export const arrayIndexed = <T extends [...any]>(arr: T[]): [index: number, ...rest: T][] =>
  arr.map((el, i) => [i, ...el]);

test('helper method: indexArray(arr[][]): returns a new array where the first element it the index of the old array element', () => {
  expect(arrayIndexed([['a'], ['b']])).toMatchObject([
    [0, 'a'],
    [1, 'b'],
  ]);

  expect(arrayIndexed([['buildTypeNames', ['Droid,Starship'], 'Droid;Starship;']])).toMatchObject([
    [0, 'buildTypeNames', ['Droid,Starship'], 'Droid;Starship;'],
  ]);
});
//#endregion

//#region tests regexps against patterns
/**
 * helper function that tests a RegExp against a list of patterns and returns true if the test passed, false otherwise
 *
 * @param regexpFor The RegExp to be tested
 * @param patternIndex index of pattern in validPattern where the test is expected to pass
 */
const testRegexpAgainstPatterns = (regexpFor: RegExp, patternIndex: number) => {
  describe.each(validPatterns)(`regexp.test(pattern): using regexp: '${regexpFor.source}'`, (index, pattern) => {
    if (index === patternIndex) {
      it(`passed: returned 'true'  at index: ${index} when tested on pattern: ${pattern}`, () => {
        expect(regexpFor.test(pattern)).toBe(true);
      });
    } else {
      it(`failed: returned 'false' at index: ${index} when tested on pattern: ${pattern}`, () => {
        expect(regexpFor.test(pattern)).toBe(false);
      });
    }
  });
};
//#endregion

//#endregion

//#region global variables
const Droid = TypeName.fromString('Droid');
const Starship = TypeName.fromString('Starship');
const Human = TypeName.fromString('Human');
const Movie = TypeName.fromString('Movie');

const id = FieldName.fromString('id');
const name = FieldName.fromString('name');
const friends = FieldName.fromString('friends');
const friend = FieldName.fromString('friend');
const title = FieldName.fromString('title');
const episode = FieldName.fromString('episode');
const length = FieldName.fromString('length');

const validPatterns = arrayIndexed([
  // [index, pattern]
  ['Droid;Starship;'],
  ['@*TypeNames;'],
  ['@*TypeNames-[Droid,Starship];'],
  ['Droid.[id,name,friends];Human.[id,name,title];Starship.[name,length];'],
  ['Droid.@*FieldNames;Movie.@*FieldNames;'],
  ['Droid.@*FieldNames-[id,name,friends];Human.@*FieldNames-[id,name,title];Starship.@*FieldNames-[name,length];'],
  ['@*TypeNames.[id,name,friends];'],
  ['@*TypeNames.@*FieldNames;'],
  ['@*TypeNames.@*FieldNames-[id,name,friends];'],
  ['@*TypeNames-[Droid,Human].[id,name,friends];'],
  ['@*TypeNames-[Droid,Human].@*FieldNames;'],
  ['@*TypeNames-[Droid,Human].@*FieldNames-[id,name,friends];'],
]);
//#endregion

//#region integrity checks
describe('integrity checks: ensures that the following are not modified accidentally', () => {
  // Hard coded for integrity purposes. Update this if more Regexp are added
  const expectedTypeNamePatternCount = 3;
  const expectedFieldNamePatternCount = 9;
  const expectedCount = expectedTypeNamePatternCount + expectedFieldNamePatternCount;

  const definedTypeNamePatternBuilders = Object.getOwnPropertyNames(TypeNamePattern).filter(
    method => method.startsWith('for') && typeof TypeNamePattern[method] === 'function'
  );

  const definedFieldNamePatternBuilders = Object.getOwnPropertyNames(FieldNamePattern).filter(
    method => method.startsWith('for') && typeof FieldNamePattern[method] === 'function'
  );

  const definedBuilders = definedTypeNamePatternBuilders.concat(definedFieldNamePatternBuilders);

  const definedTypeNamePatternRegexps = Object.getOwnPropertyNames(TypeNamePattern).filter(
    property => TypeNamePattern[property] instanceof RegExp
  );

  const definedFieldNamePatternRegexps = Object.getOwnPropertyNames(FieldNamePattern).filter(
    property => FieldNamePattern[property] instanceof RegExp
  );

  const definedRegExps = definedTypeNamePatternRegexps.concat(definedFieldNamePatternRegexps);

  const definedTypeNamePatternMatchAndConfigureMethods = Object.getOwnPropertyNames(TypeNamePattern).filter(
    method => method.startsWith('matchAndConfigure') && typeof TypeNamePattern[method] === 'function'
  );

  const definedFieldNamePatternMatchAndConfigureMethods = Object.getOwnPropertyNames(FieldNamePattern).filter(
    method => method.startsWith('matchAndConfigure') && typeof FieldNamePattern[method] === 'function'
  );

  const definedMatchAndConfigureMethods = definedTypeNamePatternMatchAndConfigureMethods.concat(
    definedFieldNamePatternMatchAndConfigureMethods
  );

  // hard-coded baseNames
  const baseNames = [
    'TypeNames',
    'AllTypeNames',
    'AllTypeNamesExcludeTypeNames',
    'FieldNamesOfTypeName',
    'AllFieldNamesOfTypeName',
    'AllFieldNamesExcludeFieldNamesOfTypeName',
    'FieldNamesOfAllTypeNames',
    'AllFieldNamesOfAllTypeNames',
    'AllFieldNamesExcludeFieldNamesOfAllTypeNames',
    'FieldNamesOfAllTypeNamesExcludeTypeNames',
    'AllFieldNamesOfAllTypeNamesExcludeTypeNames',
    'AllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames',
  ];
  // dynamically generated baseNames
  const matchList: string[] = Pattern.getMatchList('Pattern');
  describe('pattern builders:', () => {
    it(`all ${expectedCount} pattern builders are accounted for`, () => {
      expect(definedBuilders.length).toBe(expectedCount);
    });

    it(`all ${expectedCount} pattern builders are  defined in order`, () => {
      expect(definedBuilders).toMatchObject(baseNames.map(baseName => `for${baseName}`));
    });
  });

  describe('Regular Expressions:', () => {
    it(`all ${expectedCount} Regular Expressions are accounted for`, () => {
      expect(definedRegExps.length).toBe(expectedCount);
    });

    it(`all ${expectedCount} Regular Expression are  defined in order`, () => {
      expect(definedRegExps).toMatchObject(baseNames.map(baseName => `regexpFor${baseName}`));
    });
  });

  describe('matchAndConfigure Methods:', () => {
    it(`all ${expectedCount} matchAndConfigure methods are accounted for and defined in order`, () => {
      expect(definedMatchAndConfigureMethods.length).toBe(expectedCount);
    });

    it(`all ${expectedCount} matchAndConfigure methods are  defined in order`, () => {
      expect(definedMatchAndConfigureMethods).toMatchObject(baseNames.map(baseName => `matchAndConfigure${baseName}`));
    });
  });

  describe('baseNames(hard-coded) vrs matchList(dynamically-generated):', () => {
    it('baseNames is equal to matchList', () => {
      expect(baseNames).toMatchObject(matchList);
    });
  });

  describe(`TypeName, FieldName and Pattern: Value Objects that ensures that the value set is valid and can only be set using special methods that initialize the class with a valid value `, () => {
    describe('Exception Throwers:', () => {
      it('TypeName.fromString: throws when TypeName is created from an empty string', () => {
        expect(() => TypeName.fromString('')).toThrow();
      });

      it('FieldName.fromString: throws when FieldName is created from an empty string', () => {
        expect(() => FieldName.fromString('')).toThrow();
      });

      it('TypeNamePattern.forTypeNames: throws when it receives an empty array as parameter', () => {
        expect(() => TypeNamePattern.forTypeNames([])).toThrow();
      });

      it('TypeNamePattern.forAllTypeNamesExcludeTypeNames: throws when it receives an empty array as parameter', () => {
        expect(() => TypeNamePattern.forAllTypeNamesExcludeTypeNames([])).toThrow();
      });

      it('FieldPattern.forAllFieldNamesOfTypeName: throws when it receives an empty array as parameter', () => {
        expect(() => FieldNamePattern.forAllFieldNamesOfTypeName([])).toThrow();
      });

      it('FieldNamePattern.forAllFieldNamesExcludeFieldNamesOfTypeName: throws when it receives an empty array as parameter', () => {
        expect(() => FieldNamePattern.forAllFieldNamesExcludeFieldNamesOfTypeName([])).toThrow();
        expect(() => FieldNamePattern.forAllFieldNamesExcludeFieldNamesOfTypeName([[Droid, []]])).toThrow();
        expect(() => FieldNamePattern.forAllFieldNamesExcludeFieldNamesOfTypeName([[[], id]])).toThrow();
        expect(() => FieldNamePattern.forAllFieldNamesExcludeFieldNamesOfTypeName([[[], []]])).toThrow();
      });

      it('FieldNamePattern.forFieldNamesOfAllTypeNamesExcludeTypeNames: throws when it receives an empty array as parameter', () => {
        expect(() => FieldNamePattern.forFieldNamesOfAllTypeNamesExcludeTypeNames([], [id])).toThrow();
        expect(() => FieldNamePattern.forFieldNamesOfAllTypeNamesExcludeTypeNames([Droid], [])).toThrow();
        expect(() => FieldNamePattern.forFieldNamesOfAllTypeNamesExcludeTypeNames([], [])).toThrow();
      });

      it('FieldNamePattern.forAllFieldNamesOfAllTypeNamesExcludeTypeNames: throws when it receives an empty array as parameter', () => {
        expect(() => FieldNamePattern.forAllFieldNamesOfAllTypeNamesExcludeTypeNames([])).toThrow();
      });

      it('FieldNamePattern.forFieldNamesOfAllTypeNames: throws when it receives an empty array as parameter', () => {
        expect(() => FieldNamePattern.forFieldNamesOfAllTypeNames([])).toThrow();
      });

      it('FieldNamePattern.forFieldNamesOfTypeName: throws when it receives an empty array as parameter', () => {
        expect(() => FieldNamePattern.forFieldNamesOfTypeName([])).toThrow();
        expect(() => FieldNamePattern.forFieldNamesOfTypeName([[Droid, []]])).toThrow();
        expect(() => FieldNamePattern.forFieldNamesOfTypeName([[[], id]])).toThrow();
        expect(() => FieldNamePattern.forFieldNamesOfTypeName([[[], []]])).toThrow();
      });

      it('FieldNamePattern.forAllFieldNamesExcludeFieldNamesOfAllTypeNames: throws when it receives an empty array as parameter', () => {
        expect(() => FieldNamePattern.forAllFieldNamesExcludeFieldNamesOfAllTypeNames([])).toThrow();
      });

      it('FieldNamePattern.forAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames: throws when it receives an empty array as parameter', () => {
        expect(() =>
          FieldNamePattern.forAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames([], [id])
        ).toThrow();
        expect(() =>
          FieldNamePattern.forAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames([Droid], [])
        ).toThrow();
        expect(() =>
          FieldNamePattern.forAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames([], [])
        ).toThrow();
      });
    });

    describe.each([
      ',',
      '.',
      '/',
      '<',
      '>',
      '?',
      ':',
      "'",
      '"',
      '[',
      ']',
      '{',
      '}',
      '\\',
      '|',
      '+',
      '=',
      '`',
      '~',
      '!',
      '@',
      '#',
      '$',
      '%',
      '^',
      '&',
      '*',
      '(',
      ')',
      // '_', // underscore is a valid character
      '-',
      '+',
      '=',
      'space ',
      'tab\t',
      'newline\n',
    ])('throws an error if value is not AlphaNumeric', invalidCharacter => {
      const invalidName = `Invalid${invalidCharacter}Name`;
      it(`TypeName and FieldName throws an error when the name contains: ${invalidCharacter}`, () => {
        expect(() => TypeName.fromString(invalidName)).toThrow();
        expect(() => FieldName.fromString(invalidName)).toThrow();
      });
    });
  });
});
//#endregion

//#region builders, RegExp and matchers

//#region TypeNamePattern
//#region `'TypeName;AnotherTypeName;'`
describe('Configuring specific Graphql Types:', () => {
  const [patternIndex, expectedPattern] = validPatterns[0];
  const pattern = TypeNamePattern.forTypeNames([Droid, Starship]);

  describe('Pattern.forTypeNames:', () => {
    it('builds the expected pattern', () => {
      expect(pattern.value).toBe(expectedPattern);
    });
  });

  describe('Pattern.regexpForTypeNames:', () => {
    const regexpForTypeNames = TypeNamePattern.regexpForTypeNames;

    test('integrity check: the RegExp is not modified accidentally', () => {
      expect(regexpForTypeNames.source).toBe(/\b(?!TypeNames|FieldNames\b)(?<typeName>\w+;)/gim.source);
    });

    testRegexpAgainstPatterns(regexpForTypeNames, patternIndex);
  });

  describe(`Pattern.matchAndConfigureTypeNames: using pattern: '${expectedPattern}'`, () => {
    describe.each([Droid, Starship])(
      '%s will match and it will be configured because it was specified in the pattern',
      typeName => {
        const key = typeName.value;
        const result = TypeNamePattern.matchAndConfigureTypeNames(pattern, typeName);

        it(`will match because '${typeName.value}' was specified in the pattern`, () => {
          expect(result[key]?.matchFound).toBe(true);
        });

        it(`will  be configured because '${typeName.value}' was  specified in the pattern`, () => {
          expect(result[key]?.shouldBeConfigured).toBe(true);
        });
      }
    );

    describe.each([Human, Movie])(
      '%s will not match neither will it be configured because it was not specified in the pattern',
      typeName => {
        const key = typeName.value;
        const result = TypeNamePattern.matchAndConfigureTypeNames(pattern, typeName);

        it(`will not match because '${typeName.value}' was not specified in the pattern`, () => {
          expect(result[key]?.matchFound).toBeUndefined();
        });

        it(`will not be configured because '${typeName.value}' was not specified in the pattern`, () => {
          expect(result[key]?.shouldBeConfigured).toBeUndefined();
        });
      }
    );
  });
});
//#endregion

//#region `'@*TypeNames;'`
describe('Configuring all Graphql Types:', () => {
  const [patternIndex, expectedPattern] = validPatterns[1];
  const pattern = TypeNamePattern.forAllTypeNames();

  describe('Patterns.forAllTypeNames:', () => {
    it('builds the expected pattern', () => {
      expect(pattern.value).toBe(expectedPattern);
    });
  });

  describe('Pattern.regexpForAllTypeNames:', () => {
    const regexpForAllTypeNames = TypeNamePattern.regexpForAllTypeNames;

    test('integrity check: the RegExp is not modified accidentally', () => {
      expect(regexpForAllTypeNames.source).toBe(/(?<allTypeNames>@\*TypeNames;)/gim.source);
    });

    testRegexpAgainstPatterns(regexpForAllTypeNames, patternIndex);
  });

  describe(`Patterns.matchAndConfigureAllTypeNames: using pattern: '${expectedPattern}'`, () => {
    describe.each([Droid, Starship, Human, Movie])(
      `will match and it will be configured: using pattern: '${expectedPattern}'`,
      typeName => {
        const key = typeName.value;
        const result = TypeNamePattern.matchAndConfigureAllTypeNames(pattern, typeName);

        it(`will match because ${pattern} includes '${typeName.value}'`, () => {
          expect(result[key]?.matchFound).toBe(true);
        });

        it(`will be configured because ${pattern} includes '${typeName.value}'`, () => {
          expect(result[key]?.shouldBeConfigured).toBe(true);
        });
      }
    );
  });
});
//#endregion

//#region `'@*TypeNames-[excludeTypeNames];'`
describe('Configuring all Graphql Types except those specified in the exclusion list of TypeNames:', () => {
  const [patternIndex, expectedPattern] = validPatterns[2];
  const pattern = TypeNamePattern.forAllTypeNamesExcludeTypeNames([Droid, Starship]);

  describe('Pattern.forAllTypeNamesExcludeTypeNames:', () => {
    it('builds the expected pattern', () => {
      expect(pattern.value).toBe(expectedPattern);
    });
  });

  describe('Pattern.regexpForAllTypeNamesExcludeTypeNames:', () => {
    const regexpForAllTypeNamesExcludeTypeNames = TypeNamePattern.regexpForAllTypeNamesExcludeTypeNames;

    test('integrity check: the RegExp is not modified accidentally', () => {
      expect(regexpForAllTypeNamesExcludeTypeNames.source).toBe(
        /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\];/gim.source
      );
    });

    testRegexpAgainstPatterns(regexpForAllTypeNamesExcludeTypeNames, patternIndex);
  });

  describe(`Patterns.matchAndConfigureAllTypeNamesExcludeTypeNames: using pattern: '${expectedPattern}'`, () => {
    describe.each([Droid, Starship])(
      `%s will match but it will not be configured: using pattern: '${expectedPattern}'`,
      typeName => {
        const key = typeName.value;
        const result = TypeNamePattern.matchAndConfigureAllTypeNamesExcludeTypeNames(pattern, typeName);
        it(`will match because '${typeName.value}' was specified in the pattern`, () => {
          expect(result[key]?.matchFound).toBe(true);
        });

        it(`will not be configured because the pattern excludes '${typeName.value}'`, () => {
          expect(result[key]?.shouldBeConfigured).toBe(false);
        });
      }
    );

    describe.each([Human, Movie])(
      `%s will not match but it will be configured: using pattern: '${expectedPattern}'`,
      typeName => {
        const key = typeName.value;
        const result = TypeNamePattern.matchAndConfigureAllTypeNamesExcludeTypeNames(pattern, typeName);
        it(`will not match because '${typeName.value}' was not specified in the pattern`, () => {
          expect(result[key]?.matchFound).toBe(false);
        });

        it(`will be configured because the pattern includes '${typeName.value}'`, () => {
          expect(result[key]?.shouldBeConfigured).toBe(true);
        });
      }
    );
  });
});
//#endregion
//#endregion

//#region FieldNamePattern
//#region `'TypeName.[fieldNames];'`
describe('Configuring specific fields of a specific Graphql Type:', () => {
  const [patternIndex, expectedPattern] = validPatterns[3];

  const pattern = FieldNamePattern.forFieldNamesOfTypeName([
    [Droid, [id, name, friends]], // individual
    [Human, [id, name, title]], // individual
    [Starship, [name, length]], // individual
  ]);

  describe('Pattern.forFieldNamesOfTypeName:', () => {
    describe('builds the expected pattern given an array where each element is a tuple allowing you to compose:', () => {
      it('1. individually: where the first tuple element is the TypeName and the second contains a list of FieldNames of that TypeName', () => {
        expect(pattern.value).toBe(expectedPattern);
      });

      it('2. shared: where the first tuple element is a list of TypeNames and the second is a list of FieldNames common to all the TypeNames in the first element', () => {
        expect(
          FieldNamePattern.forFieldNamesOfTypeName([
            [[Droid, Human], id], // shared
            [[Droid, Human, Starship], [name]], // shared
            [Starship, [length]], //shared,just with nobody
            [Droid, friends], //shared,just with nobody
            [Human, title], //shared,just with nobody
          ]).value
        ).toBe(expectedPattern);
      });

      it('3. combined: where the first tuple element is a single/list of TypeNames and the second is a list of FieldNames common to only/all of the TypeNames in the first element', () => {
        expect(
          FieldNamePattern.forFieldNamesOfTypeName([
            [Droid, [id, name, friends]], // individual
            [Human, id], // individual
            [[Human, Starship], [name]], // shared
            [Human, [title]], // individual
            [Starship, length], // individual
          ]).value
        ).toBe(expectedPattern);
      });
    });
  });

  describe('Pattern.regexpForFieldNamesOfTypeName:', () => {
    const regexpForFieldNamesOfTypeName = FieldNamePattern.regexpForFieldNamesOfTypeName;

    test('integrity check: the RegExp is not modified accidentally', () => {
      expect(regexpForFieldNamesOfTypeName.source).toBe(
        /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim.source
      );
    });

    testRegexpAgainstPatterns(regexpForFieldNamesOfTypeName, patternIndex);
  });

  describe(`Pattern.matchAndConfigureFieldNamesOfTypeName: using pattern: '${expectedPattern}'`, () => {
    describe.each([
      [Droid, id],
      [Droid, name],
      [Droid, friends],

      [Human, id],
      [Human, name],
      [Human, title],

      [Starship, name],
      [Starship, length],
    ])(`%s.%s will match and it will be configured: using pattern: '${expectedPattern}'`, (typeName, fieldName) => {
      const key = `${typeName.value}.${fieldName.value}`;
      const result = FieldNamePattern.matchAndConfigureFieldNamesOfTypeName(pattern, typeName, fieldName);

      it(`will match because when expanded, '${typeName.value}.${fieldName.value}' was specified in the pattern`, () => {
        expect(result[key]?.matchFound).toBe(true);
      });

      it(`will be configured because when expanded, '${typeName.value}.${fieldName.value}' was specified in the pattern`, () => {
        expect(result[key]?.shouldBeConfigured).toBe(true);
      });
    });

    describe.each([
      [Droid, friend],
      [Droid, title],
      [Droid, episode],
      [Droid, length],

      [Starship, id],
      [Starship, friends],
      [Starship, friend],
      [Starship, title],
      [Starship, episode],

      [Human, friends],
      [Human, friend],
      [Human, episode],
      [Human, length],

      [Movie, id],
      [Movie, name],
      [Movie, friends],
      [Movie, friend],
      [Movie, title],
      [Movie, episode],
      [Movie, length],
    ])(
      `%s.%s will not match neither will it be configured: using pattern: '${expectedPattern}'`,
      (typeName, fieldName) => {
        const key = `${typeName.value}.${fieldName.value}`;
        const result = FieldNamePattern.matchAndConfigureFieldNamesOfTypeName(pattern, typeName, fieldName);

        it(`will not match because when expanded, '${typeName.value}.${fieldName.value}' was not specified in the pattern`, () => {
          expect(result[key]?.matchFound).toBeUndefined();
        });

        it(`will not be configured because when expanded, '${typeName.value}.${fieldName.value}' was not specified in the pattern`, () => {
          expect(result[key]?.shouldBeConfigured).toBeUndefined();
        });
      }
    );
  });
});
//#endregion

//#region `'TypeName.@*FieldNames;'`
describe('Configuring all fields of a specific Graphql Type:', () => {
  const [patternIndex, expectedPattern] = validPatterns[4];
  const pattern = FieldNamePattern.forAllFieldNamesOfTypeName([Droid, Movie]);

  describe('Pattern.forAllFieldNamesOfTypeName:', () => {
    it('builds the expected pattern for each TypeName in a list of TypeNames:', () => {
      expect(pattern.value).toBe(expectedPattern);
    });
  });

  describe('Pattern.regexpForAllFieldNamesOfTypeName:', () => {
    const regexpForAllFieldNamesOfTypeName = FieldNamePattern.regexpForAllFieldNamesOfTypeName;

    test('integrity check: the RegExp is not modified accidentally', () => {
      expect(regexpForAllFieldNamesOfTypeName.source).toBe(
        /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.@\*FieldNames;/gim.source
      );
    });

    testRegexpAgainstPatterns(regexpForAllFieldNamesOfTypeName, patternIndex);
  });

  describe(`Pattern.matchAndConfigureAllFieldNamesOfTypeName: using pattern: '${expectedPattern}'`, () => {
    describe.each([
      [Droid, id],
      [Droid, name],
      [Droid, friends],
      [Droid, friend],
      [Droid, title],
      [Droid, episode],
      [Droid, length],

      [Movie, id],
      [Movie, name],
      [Movie, friends],
      [Movie, friend],
      [Movie, title],
      [Movie, episode],
      [Movie, length],
    ])(`%s will match and it will be configured: using pattern: '${expectedPattern}'`, (typeName, fieldName) => {
      const key = `${typeName.value}.${fieldName.value}`;
      const result = FieldNamePattern.matchAndConfigureAllFieldNamesOfTypeName(pattern, typeName, fieldName);

      it(`will match because '${typeName.value}' was specified in the pattern and the pattern includes '${typeName.value}.${fieldName.value}'`, () => {
        expect(result[key]?.matchFound).toBe(true);
      });

      it(`will be configured because '${typeName.value}' was specified in the pattern and the pattern includes '${typeName.value}.${fieldName.value}'`, () => {
        expect(result[key]?.shouldBeConfigured).toBe(true);
      });
    });

    describe.each([
      // Starship, Human
      [Starship, id],
      [Starship, name],
      [Starship, friends],
      [Starship, friend],
      [Starship, title],
      [Starship, episode],
      [Starship, length],

      [Human, id],
      [Human, name],
      [Human, friends],
      [Human, friend],
      [Human, title],
      [Human, episode],
      [Human, length],
    ])(
      `%s will not match neither will it be configured: using pattern: '${expectedPattern}'`,
      (typeName, fieldName) => {
        const key = `${typeName.value}.${fieldName.value}`;
        const result = FieldNamePattern.matchAndConfigureAllFieldNamesOfTypeName(pattern, typeName, fieldName);

        it(`will not match because '${typeName.value}' was not specified in the pattern`, () => {
          expect(result[key]?.matchFound).toBeUndefined();
        });

        it(`will not be configured because '${typeName.value}' was not specified in the pattern`, () => {
          expect(result[key]?.shouldBeConfigured).toBeUndefined();
        });
      }
    );
  });
});
//#endregion

//#region `'TypeName.@*FieldNames-[excludeFieldNames];'`
describe('Configuring all fields except those specified in the exclusion list of FieldNames for a specific GraphQL Type:', () => {
  const [patternIndex, expectedPattern] = validPatterns[5];
  const pattern = FieldNamePattern.forAllFieldNamesExcludeFieldNamesOfTypeName([
    [Droid, [id, name, friends]], // individual
    [Human, [id, name, title]], // individual
    [Starship, [name, length]], // individual
  ]);
  describe('Pattern.forAllFieldNamesExcludeFieldNamesOfTypeName:', () => {
    describe('builds the expected pattern given an array where each element is a tuple allowing you to compose:', () => {
      it('1. individually: where the first tuple element is the TypeName and the second contains a list of FieldNames of that TypeName', () => {
        expect(pattern.value).toBe(expectedPattern);
      });

      it('2. shared: where the first tuple element is a list of TypeNames and the second is a list of FieldNames common to all the TypeNames in the first element', () => {
        expect(
          FieldNamePattern.forAllFieldNamesExcludeFieldNamesOfTypeName([
            [[Droid, Human], id], // shared
            [[Droid, Human, Starship], [name]], // shared
            [Starship, [length]], //shared,just with nobody
            [Droid, friends], //shared,just with nobody
            [Human, title], //shared,just with nobody
          ]).value
        ).toBe(expectedPattern);
      });

      it('3. combined: where the first tuple element is a single/list of TypeNames and the second is a list of FieldNames common to only/all of the TypeNames in the first element', () => {
        expect(
          FieldNamePattern.forAllFieldNamesExcludeFieldNamesOfTypeName([
            [Droid, [id, name, friends]], // individual
            [Human, id], // individual
            [[Human, Starship], [name]], // shared
            [Human, [title]], // individual
            [Starship, length], // individual
          ]).value
        ).toBe(expectedPattern);
      });
    });
  });

  describe('Pattern.regexpForAllFieldNamesExcludeFieldNamesOfTypeName:', () => {
    const regexpForAllFieldNamesExcludeFieldNamesOfTypeName =
      FieldNamePattern.regexpForAllFieldNamesExcludeFieldNamesOfTypeName;

    test('integrity check: the RegExp is not modified accidentally', () => {
      expect(regexpForAllFieldNamesExcludeFieldNamesOfTypeName.source).toBe(
        /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.@\*FieldNames-\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim.source
      );
    });

    testRegexpAgainstPatterns(regexpForAllFieldNamesExcludeFieldNamesOfTypeName, patternIndex);
  });

  describe(`Pattern.matchAndConfigureAllFieldNamesExcludeFieldNamesOfTypeName: using pattern: '${expectedPattern}'`, () => {
    describe.each([
      [Droid, id],
      [Droid, name],
      [Droid, friends],

      [Human, id],
      [Human, name],
      [Human, title],

      [Starship, name],
      [Starship, length],
    ])(`%s.%s will match but it will not be configured: using pattern: '${expectedPattern}'`, (typeName, fieldName) => {
      const key = `${typeName.value}.${fieldName.value}`;
      const result = FieldNamePattern.matchAndConfigureAllFieldNamesExcludeFieldNamesOfTypeName(
        pattern,
        typeName,
        fieldName
      );
      it(`will match because when expanded, '${typeName.value}.${fieldName.value}' was specified in the pattern`, () => {
        expect(result[key]?.matchFound).toBe(true);
      });

      it(`will not be because when expanded, the pattern excludes '${typeName.value}.${fieldName.value}'`, () => {
        expect(result[key]?.shouldBeConfigured).toBe(false);
      });
    });

    describe.each([
      [Droid, friend],
      [Droid, title],
      [Droid, episode],
      [Droid, length],

      [Starship, id],
      [Starship, friends],
      [Starship, friend],
      [Starship, title],
      [Starship, episode],

      [Human, friends],
      [Human, friend],
      [Human, episode],
      [Human, length],
    ])(`%s.%s will not match but it will be configured: using pattern: '${expectedPattern}'`, (typeName, fieldName) => {
      const key = `${typeName.value}.${fieldName.value}`;
      const result = FieldNamePattern.matchAndConfigureAllFieldNamesExcludeFieldNamesOfTypeName(
        pattern,
        typeName,
        fieldName
      );

      it(`will not match because when expanded, '${typeName.value}.${fieldName.value}' was not specified in the pattern`, () => {
        expect(result[key]?.matchFound).toBe(false);
      });

      it(`will be configured because when expanded, the pattern includes '${typeName.value}.${fieldName.value}'`, () => {
        expect(result[key]?.shouldBeConfigured).toBe(true);
      });
    });

    describe.each([
      [Movie, id],
      [Movie, name],
      [Movie, friends],
      [Movie, friend],
      [Movie, title],
      [Movie, episode],
      [Movie, length],
    ])(
      `%s.%s will not match neither will it be configured using pattern: '${expectedPattern}'`,
      (typeName, fieldName) => {
        const key = `${typeName.value}.${fieldName.value}`;
        const result = FieldNamePattern.matchAndConfigureAllFieldNamesExcludeFieldNamesOfTypeName(
          pattern,
          typeName,
          fieldName
        );

        it(`will match because when expanded, '${typeName.value}.${fieldName.value}' was not specified in the pattern`, () => {
          expect(result[key]?.matchFound).toBeUndefined();
        });

        it(`will not be configured because when expanded, '${typeName.value}.${fieldName.value}' was not specified in the pattern`, () => {
          expect(result[key]?.shouldBeConfigured).toBeUndefined();
        });
      }
    );
  });
});
//#endregion

//#region `'@*TypeNames.[fieldNames];'`
describe('Configuring specific fields for all Graphql Types:', () => {
  const [patternIndex, expectedPattern] = validPatterns[6];
  const pattern = FieldNamePattern.forFieldNamesOfAllTypeNames([id, name, friends]);

  describe('Pattern.forFieldNamesOfAllTypeNames:', () => {
    describe('builds the expected pattern for the list of FieldNames:', () => {
      expect(pattern.value).toBe(expectedPattern);
    });
  });

  describe('Pattern.regexpForFieldNamesOfAllTypeNames:', () => {
    const regexpForFieldNamesOfAllTypeNames = FieldNamePattern.regexpForFieldNamesOfAllTypeNames;

    test('integrity check: the RegExp is not modified accidentally', () => {
      expect(regexpForFieldNamesOfAllTypeNames.source).toBe(
        /@\*TypeNames\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim.source
      );
    });

    testRegexpAgainstPatterns(regexpForFieldNamesOfAllTypeNames, patternIndex);
  });

  describe(`Pattern.matchAndConfigureFieldNamesOfAllTypeNames: using pattern: '${expectedPattern}'`, () => {
    describe.each([
      [Droid, id],
      [Droid, name],
      [Droid, friends],

      [Starship, id],
      [Starship, name],
      [Starship, friends],

      [Human, id],
      [Human, name],
      [Human, friends],

      [Movie, id],
      [Movie, name],
      [Movie, friends],
    ])(`%s.%s will match and it will be configured: using pattern: '${expectedPattern}'`, (typeName, fieldName) => {
      const key = `${typeName.value}.${fieldName.value}`;
      const result = FieldNamePattern.matchAndConfigureFieldNamesOfAllTypeNames(pattern, typeName, fieldName);

      it(`will match because '${fieldName.value}' was specified in the pattern`, () => {
        expect(result[key]?.matchFound).toBe(true);
      });

      it(`will be configured because '${fieldName.value}' was specified in the pattern`, () => {
        expect(result[key]?.shouldBeConfigured).toBe(true);
      });
    });

    describe.each([
      [Droid, friend],
      [Droid, title],
      [Droid, episode],
      [Droid, length],

      [Starship, friend],
      [Starship, title],
      [Starship, episode],
      [Starship, length],

      [Human, friend],
      [Human, title],
      [Human, episode],
      [Human, length],

      [Movie, friend],
      [Movie, title],
      [Movie, episode],
      [Movie, length],
    ])(
      `%s will not match neither will it be configured: using pattern: '${expectedPattern}'`,
      (typeName, fieldName) => {
        const key = `${typeName.value}.${fieldName.value}`;
        const result = FieldNamePattern.matchAndConfigureFieldNamesOfAllTypeNames(pattern, typeName, fieldName);

        it(`will not match because '${fieldName.value}' was not specified in the pattern`, () => {
          expect(result[key]?.matchFound).toBeUndefined();
        });

        it(`will not not be configured because '${fieldName.value}' was not specified in the pattern`, () => {
          expect(result[key]?.shouldBeConfigured).toBeUndefined();
        });
      }
    );
  });
});
//#endregion

//#region `'@*TypeNames.@*FieldNames;'`
describe('Configuring all fields for all Graphql Types:', () => {
  const [patternIndex, expectedPattern] = validPatterns[7];
  const pattern = FieldNamePattern.forAllFieldNamesOfAllTypeNames();

  describe('Pattern.forAllFieldNamesOfAllTypeNames:', () => {
    describe('builds the expected pattern:', () => {
      expect(pattern.value).toBe(expectedPattern);
    });
  });

  describe('Pattern.regexpForAllFieldNamesOfAllTypeNames:', () => {
    const regexpForAllFieldNamesOfAllTypeNames = FieldNamePattern.regexpForAllFieldNamesOfAllTypeNames;

    test('integrity check: the RegExp is not modified accidentally', () => {
      expect(regexpForAllFieldNamesOfAllTypeNames.source).toBe(/@\*TypeNames\.@\*FieldNames;/gim.source);
    });

    testRegexpAgainstPatterns(regexpForAllFieldNamesOfAllTypeNames, patternIndex);
  });

  describe(`Pattern.matchAndConfigureAllFieldNamesOfAllTypeNames: using pattern: '${expectedPattern}'`, () => {
    describe.each([
      [Droid, id],
      [Droid, name],
      [Droid, friends],
      [Droid, friend],
      [Droid, title],
      [Droid, episode],
      [Droid, length],

      [Starship, id],
      [Starship, name],
      [Starship, friends],
      [Starship, friend],
      [Starship, title],
      [Starship, episode],
      [Starship, length],

      [Human, id],
      [Human, name],
      [Human, friends],
      [Human, friend],
      [Human, title],
      [Human, episode],
      [Human, length],

      [Movie, id],
      [Movie, name],
      [Movie, friends],
      [Movie, friend],
      [Movie, title],
      [Movie, episode],
      [Movie, length],
    ])(`will match and it will be configured: using pattern: '${expectedPattern}'`, (typeName, fieldName) => {
      const key = `${typeName.value}.${fieldName.value}`;
      const result = FieldNamePattern.matchAndConfigureAllFieldNamesOfAllTypeNames(pattern, typeName, fieldName);

      it(`will match because ${pattern} includes '${typeName.value}.${fieldName.value}'`, () => {
        expect(result[key]?.matchFound).toBe(true);
      });

      it(`will be configured because ${pattern} includes '${typeName.value}.${fieldName.value}'`, () => {
        expect(result[key]?.shouldBeConfigured).toBe(true);
      });
    });
  });
});
//#endregion

//#region `'@*TypeNames.@*FieldNames-[excludeFieldNames];'`
describe('Configuring all fields except those specified in the exclusion list of FieldNames for all GraphQL Types:', () => {
  const [patternIndex, expectedPattern] = validPatterns[8];
  const pattern = FieldNamePattern.forAllFieldNamesExcludeFieldNamesOfAllTypeNames([id, name, friends]);

  describe('Pattern.forAllFieldNamesExcludeFieldNamesOfAllTypeNames:', () => {
    describe('builds the expected pattern:', () => {
      expect(pattern.value).toBe(expectedPattern);
    });
  });

  describe('Pattern.regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNames:', () => {
    const regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNames =
      FieldNamePattern.regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNames;

    test('integrity check: the RegExp is not modified accidentally', () => {
      expect(regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNames.source).toBe(
        /@\*TypeNames\.@\*FieldNames-\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim.source
      );
    });

    testRegexpAgainstPatterns(regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNames, patternIndex);
  });

  describe(`Pattern.matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNames: using pattern: '${expectedPattern}'`, () => {
    describe.each([
      [Droid, id],
      [Droid, name],
      [Droid, friends],

      [Starship, id],
      [Starship, name],
      [Starship, friends],

      [Human, id],
      [Human, name],
      [Human, friends],

      [Movie, id],
      [Movie, name],
      [Movie, friends],
    ])(`%s.%s will match but it will not be configured: using pattern: '${expectedPattern}'`, (typeName, fieldName) => {
      const key = `${typeName.value}.${fieldName.value}`;
      const result = FieldNamePattern.matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNames(
        pattern,
        typeName,
        fieldName
      );

      it(`it will match because '${fieldName.value}' was specified in the exclusion list of FieldNames`, () => {
        expect(result[key]?.matchFound).toBe(true);
      });

      it(`it will not be configured because the pattern excludes '${fieldName.value}'`, () => {
        expect(result[key]?.shouldBeConfigured).toBe(false);
      });
    });

    describe.each([
      [Droid, friend],
      [Droid, title],
      [Droid, episode],
      [Droid, length],

      [Starship, friend],
      [Starship, title],
      [Starship, episode],
      [Starship, length],

      [Human, friend],
      [Human, title],
      [Human, episode],
      [Human, length],

      [Movie, friend],
      [Movie, title],
      [Movie, episode],
      [Movie, length],
    ])(
      '%s will not match but it will be configured because it was not specified in the exclusion list of FieldNames',
      (typeName, fieldName) => {
        const key = `${typeName.value}.${fieldName.value}`;
        const result = FieldNamePattern.matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNames(
          pattern,
          typeName,
          fieldName
        );

        it(`it will not match because '${fieldName.value}' was not specified in the pattern`, () => {
          expect(result[key]?.matchFound).toBe(false);
        });

        it(`it will be configured because the pattern includes '${fieldName.value}'`, () => {
          expect(result[key]?.shouldBeConfigured).toBe(true);
        });
      }
    );
  });
});
//#endregion

//#region `'@*TypeNames-[excludeTypeNames].[fieldNames];'`
describe('Configuring specific fields of all GraphQL Types except those specified in the exclusion list of TypeNames:', () => {
  const [patternIndex, expectedPattern] = validPatterns[9];
  const pattern = FieldNamePattern.forFieldNamesOfAllTypeNamesExcludeTypeNames([Droid, Human], [id, name, friends]);

  describe('Pattern.forFieldNamesOfAllTypeNamesExcludeTypeNames:', () => {
    describe('builds the expected pattern for the list of FieldNames:', () => {
      expect(pattern.value).toBe(expectedPattern);
    });
  });

  describe('Pattern.regexpForFieldNamesOfAllTypeNamesExcludeTypeNames:', () => {
    const regexpForFieldNamesOfAllTypeNamesExcludeTypeNames =
      FieldNamePattern.regexpForFieldNamesOfAllTypeNamesExcludeTypeNames;

    test('integrity check: the RegExp is not modified accidentally', () => {
      expect(regexpForFieldNamesOfAllTypeNamesExcludeTypeNames.source).toBe(
        /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\]\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim.source
      );
    });

    testRegexpAgainstPatterns(regexpForFieldNamesOfAllTypeNamesExcludeTypeNames, patternIndex);
  });

  describe(`Pattern.matchAndConfigureFieldNamesOfAllTypeNamesExcludeTypeNames: using pattern: '${expectedPattern}'`, () => {
    describe.each([
      [Droid, id],
      [Droid, name],
      [Droid, friends],

      [Human, id],
      [Human, name],
      [Human, friends],
    ])(`%s.%s will match but it will not be configured: using pattern: '${pattern}'`, (typeName, fieldName) => {
      const key = `${typeName.value}.${fieldName.value}`;
      const result = FieldNamePattern.matchAndConfigureFieldNamesOfAllTypeNamesExcludeTypeNames(
        pattern,
        typeName,
        fieldName
      );

      it(`will match because when expanded, '${typeName.value}.${fieldName.value}' was specified in the pattern`, () => {
        expect(result[key]?.matchFound).toBe(true);
      });

      it(`will not be configured because when expanded, the pattern excludes '${typeName.value}.${fieldName.value}'`, () => {
        expect(result[key]?.shouldBeConfigured).toBe(false);
      });
    });

    describe.each([
      [Starship, id],
      [Starship, name],
      [Starship, friends],

      [Movie, id],
      [Movie, name],
      [Movie, friends],
    ])(
      `%s.%s will not match but it will it be configured: using pattern: '${expectedPattern}'`,
      (typeName, fieldName) => {
        const key = `${typeName.value}.${fieldName.value}`;
        const result = FieldNamePattern.matchAndConfigureFieldNamesOfAllTypeNamesExcludeTypeNames(
          pattern,
          typeName,
          fieldName
        );

        it(`will not match because when expanded, '${typeName.value}.${fieldName.value}' was not specified in the pattern`, () => {
          expect(result[key]?.matchFound).toBe(false);
        });

        it(`will be configured because when expanded, the pattern includes '${typeName.value}.${fieldName.value}'`, () => {
          expect(result[key]?.shouldBeConfigured).toBe(true);
        });
      }
    );

    describe.each([
      [Droid, friend],
      [Droid, title],
      [Droid, episode],
      [Droid, length],

      [Starship, friend],
      [Starship, title],
      [Starship, episode],
      [Starship, length],

      [Human, friend],
      [Human, title],
      [Human, episode],
      [Human, length],

      [Movie, friend],
      [Movie, title],
      [Movie, episode],
      [Movie, length],
    ])(
      `%s.%s will not match neither will it be configured: using pattern: '${expectedPattern}'`,
      (typeName, fieldName) => {
        const key = `${typeName.value}.${fieldName.value}`;
        const result = FieldNamePattern.matchAndConfigureFieldNamesOfAllTypeNamesExcludeTypeNames(
          pattern,
          typeName,
          fieldName
        );

        it(`will not match because when expanded, '${typeName.value}.${fieldName.value}' was not specified in the pattern`, () => {
          expect(result[key]?.matchFound).toBeUndefined();
        });

        it(`will be not configured because when expanded, '${typeName.value}.${fieldName.value}' was not specified in the pattern`, () => {
          expect(result[key]?.shouldBeConfigured).toBeUndefined();
        });
      }
    );
  });
});
//#endregion

//#region `'@*TypeNames-[excludeTypeNames].@*FieldNames;'`
describe('Configuring all fields of all GraphQL Types except those specified in the exclusion list of TypeNames:', () => {
  const [patternIndex, expectedPattern] = validPatterns[10];
  const pattern = FieldNamePattern.forAllFieldNamesOfAllTypeNamesExcludeTypeNames([Droid, Human]);

  describe('Pattern.forAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames:', () => {
    describe('builds the expected pattern for the list of FieldNames:', () => {
      expect(pattern.value).toBe(expectedPattern);
    });
  });

  describe('Pattern.regexpForAllFieldNamesOfAllTypeNamesExcludeTypeNames:', () => {
    const regexpForAllFieldNamesOfAllTypeNamesExcludeTypeNames =
      FieldNamePattern.regexpForAllFieldNamesOfAllTypeNamesExcludeTypeNames;

    test('integrity check: the RegExp is not modified accidentally', () => {
      expect(regexpForAllFieldNamesOfAllTypeNamesExcludeTypeNames.source).toBe(
        /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\]\.@\*FieldNames;/gim.source
      );
    });

    testRegexpAgainstPatterns(regexpForAllFieldNamesOfAllTypeNamesExcludeTypeNames, patternIndex);
  });

  describe(`Pattern.matchAndConfigureAllFieldNamesOfAllTypeNamesExcludeTypeNames: using pattern: '${expectedPattern}'`, () => {
    describe.each([
      [Droid, id],
      [Droid, name],
      [Droid, friends],
      [Droid, friend],
      [Droid, title],
      [Droid, episode],
      [Droid, length],

      [Human, id],
      [Human, name],
      [Human, friends],
      [Human, friend],
      [Human, title],
      [Human, episode],
      [Human, length],
    ])(`%s will match but it will not be configured: using pattern: '${expectedPattern}'`, (typeName, fieldName) => {
      const key = `${typeName.value}.${fieldName.value}`;
      const result = FieldNamePattern.matchAndConfigureAllFieldNamesOfAllTypeNamesExcludeTypeNames(
        pattern,
        typeName,
        fieldName
      );

      it(`will match because '${typeName.value}' was specified in the pattern`, () => {
        expect(result[key]?.matchFound).toBe(true);
      });

      it(`will not be configured match because the pattern excludes '${typeName.value}'`, () => {
        expect(result[key]?.shouldBeConfigured).toBe(false);
      });
    });

    describe.each([
      [Starship, id],
      [Starship, name],
      [Starship, friends],
      [Starship, friend],
      [Starship, title],
      [Starship, episode],
      [Starship, length],

      [Movie, id],
      [Movie, name],
      [Movie, friends],
      [Movie, friend],
      [Movie, title],
      [Movie, episode],
      [Movie, length],
    ])(`%s will not match but it will be configured: using pattern: '${expectedPattern}'`, (typeName, fieldName) => {
      const key = `${typeName.value}.${fieldName.value}`;
      const result = FieldNamePattern.matchAndConfigureAllFieldNamesOfAllTypeNamesExcludeTypeNames(
        pattern,
        typeName,
        fieldName
      );

      it(`will not match because '${typeName.value}' was not specified in the pattern`, () => {
        expect(result[key]?.matchFound).toBe(false);
      });

      it(`will be configured match because the pattern includes '${typeName.value}'`, () => {
        expect(result[key]?.shouldBeConfigured).toBe(true);
      });
    });
  });
});
//#endregion

//#region `'@*TypeNames-[excludeTypeNames].@*FieldNames-[excludeFieldNames];'`
describe('Configuring all fields except those specified in the exclusion list of FieldNames of all GraphQL Types except those specified in the exclusion list of TypeNames:', () => {
  const [patternIndex, expectedPattern] = validPatterns[11];
  const pattern = FieldNamePattern.forAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames(
    [Droid, Human],
    [id, name, friends]
  );

  describe('Pattern.forAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames:', () => {
    describe('builds the expected pattern for the list of FieldNames:', () => {
      expect(pattern.value).toBe(expectedPattern);
    });
  });

  describe('Pattern.regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames:', () => {
    const regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames =
      FieldNamePattern.regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames;

    test('integrity check: the RegExp is not modified accidentally', () => {
      expect(regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames.source).toBe(
        /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\]\.@\*FieldNames-\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim.source
      );
    });

    testRegexpAgainstPatterns(regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames, patternIndex);
  });

  describe(`Pattern.matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames: using pattern: '${expectedPattern}'`, () => {
    describe.each([
      [Droid, id],
      [Droid, name],
      [Droid, friends],

      [Human, id],
      [Human, name],
      [Human, friends],
    ])(`%s.%s will match but it will not be configured: using pattern: '${expectedPattern}'`, (typeName, fieldName) => {
      const key = `${typeName.value}.${fieldName.value}`;
      const result = FieldNamePattern.matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames(
        pattern,
        typeName,
        fieldName
      );

      it(`will match because when expanded, '${typeName.value}.${fieldName.value}' was specified in the pattern`, () => {
        expect(result[key]?.matchFound).toBe(true);
      });

      it(`will not be configured because when expanded, the pattern excludes '${typeName.value}.${fieldName.value}'`, () => {
        expect(result[key]?.shouldBeConfigured).toBe(false);
      });
    });

    describe.each([
      [Droid, friend],
      [Droid, title],
      [Droid, episode],
      [Droid, length],

      [Starship, id],
      [Starship, name],
      [Starship, friends],
      [Starship, friend],
      [Starship, title],
      [Starship, episode],
      [Starship, length],

      [Human, friend],
      [Human, title],
      [Human, episode],
      [Human, length],

      [Movie, id],
      [Movie, name],
      [Movie, friends],
      [Movie, friend],
      [Movie, title],
      [Movie, episode],
      [Movie, length],
    ])(`%s.%s will not match but it will be configured: using pattern: ${expectedPattern}`, (typeName, fieldName) => {
      const key = `${typeName.value}.${fieldName.value}`;
      const result = FieldNamePattern.matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames(
        pattern,
        typeName,
        fieldName
      );

      it(`will not match because when expanded, '${typeName.value}.${fieldName.value}' was not specified in the pattern`, () => {
        expect(result[key]?.matchFound).toBe(false);
      });

      it(`will be configured because when expanded, the pattern includes '${typeName.value}.${fieldName.value}'`, () => {
        expect(result[key]?.shouldBeConfigured).toBe(true);
      });
    });
  });
});
//#endregion
//#endregion

//#endregion

//#region attemptMatchAndConfigure
describe('attemptMatchAndConfigure: runs through the matchList and attempt to match and configure a TypeName and/or a FieldName using a pattern', () => {
  it('will return the result of Pattern.matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNames:', () => {
    const pattern = FieldNamePattern.forAllFieldNamesExcludeFieldNamesOfAllTypeNames([id, name, friends]);
    expect(Pattern.attemptMatchAndConfigure(pattern, Droid, id)).toMatchObject(
      FieldNamePattern.matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNames(pattern, Droid, id)
    );
  });

  it('will throw an error if the pattern contains multiple patterns', () => {
    const pattern = TypeNamePattern.forTypeNames([Droid, Human]);
    expect(() => Pattern.attemptMatchAndConfigure(pattern, Droid)).toThrow();
  });

  it('will return undefined if the RegExp.test(pattern) fails meaning that the Pattern is not valid:', () => {
    const invalidPattern = { value: '@*TypeName' } as Pattern; //TypeNames not TypeName
    expect(Pattern.attemptMatchAndConfigure(invalidPattern, Droid, id)).toBeUndefined();
  });
});
//#endregion

//#region helper methods
describe('Pattern helper methods:', () => {
  const pattern1 = TypeNamePattern.forTypeNames([Droid, Movie]);
  const pattern2 = FieldNamePattern.forAllFieldNamesExcludeFieldNamesOfAllTypeNames([id, title]);
  const expected = { value: pattern1.value + pattern2.value } as Pattern;
  describe('Pattern.compose: takes a list of Patterns and joins them into one single valid pattern:', () => {
    it('throws an error if an empty array is passed as a parameter', () => {
      expect(() => Pattern.compose([])).toThrow();
    });

    it('returns a new valid pattern', () => {
      console.log(expected.value);
      expect(Pattern.compose([pattern1, pattern2]).value).toBe(expected.value);
    });
  });

  describe('Pattern.split: splits a pattern into individual patterns', () => {
    it('returns a list of patterns', () => {
      expect(Pattern.split(expected)).toMatchObject([
        TypeNamePattern.forTypeNames(Droid),
        TypeNamePattern.forTypeNames(Movie),
        pattern2,
      ]);
    });
  });
});
//#endregion
