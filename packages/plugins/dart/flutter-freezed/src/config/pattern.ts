/* eslint-disable @typescript-eslint/no-unused-vars */
import { arrayWrap, resetIndex, strToList } from '../utils.js';

/**
 * A list of GraphQL Type Names
 */
type TypeNames = TypeName | TypeName[];

/**
 * A list of field names of a GraphQL Type
 */
type FieldNames = FieldName | FieldName[];

/**
 * @name TypeName
 * @description represents a single valid GraphQL Type Name used in the GraphQL Schema provided
 * @exampleMarkdown
 * ```ts filename:"config.ts"
 * // returns a TypeName
 * let typeName: TypeName = TypeName.fromString('Droid');
 *
 * // to configure a FactoryBlock, use the `TypeName.fromUnionOfTypeNames(className, factoryName)`
 * let typeName: TypeName = TypeName.fromUnionOfTypeNames(SearchResult, Droid);

 * // the following will throw an error
 * // can contain only a single value...
 * let typeName: TypeName = TypeName.fromString('Droid, Human'); // throws an Error
 *
 * // value can not be an empty string...
 * let typeName: TypeName = TypeName.fromString(''); // throws an Error
 *
 * // value must contain only AlphaNumeric characters only...
 * let typeName: TypeName = TypeName.fromString('Invalid.Name'); // throws an Error
 * ```
 */

export class TypeName {
  private _value: string;

  private constructor(value: string) {
    this._value = value;
  }
  get value(): string {
    return this._value;
  }

  static get allTypeNames(): string {
    return '@*TypeNames';
  }

  static fromUnionOfTypeNames = (className: TypeName, factoryName: TypeName): TypeName =>
    new TypeName(`${className.value}_${factoryName.value}`);

  static fromString = (value: string) => {
    if (value === undefined || value.length < 1) {
      throw new Error('TypeName is the name of a GraphQL Type and it cannot be empty');
    } else if (/([^a-zA-Z0-9_])/gim.test(value)) {
      throw new Error(
        'TypeName is the name of a GraphQL Type and it must consist of only AlphaNumeric characters',
      );
    }
    return new TypeName(value.trim());
  };
}

/**
 * @name FieldName
 * @description Represents a single valid name of a field belong to a Graphql Type.
 * @exampleMarkdown
 * ```ts filename:"config.ts"
 * // returns a FieldName
 * let fieldName: FieldName = FieldName.fromString('id');
 *
 * // the following will throw an error
 * // can contain only a single value...
 * let fieldName: FieldName = FieldName.fromString('id, name'); // throws an Error
 *
 * // value can not be an empty string...
 * let fieldName: FieldName = FieldName.fromString(''); // throws an Error
 *
 * // value must contain only AlphaNumeric characters only...
 * let fieldName: FieldName = FieldName.fromString('Invalid.Name'); // throws an Error
 * ```
 */

export class FieldName {
  private _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  static get allFieldNames(): string {
    return '@*FieldNames';
  }

  static fromString = (value: string) => {
    if (value === undefined || value.length < 1) {
      throw new Error('FieldName is the name of a field in a GraphQL Type and it cannot be empty');
    } else if (/([^a-zA-Z0-9_])/gim.test(value)) {
      throw new Error(
        'FieldName is the name of a field in a GraphQL Type and it must consist of only AlphaNumeric characters',
      );
    }
    return new FieldName(value.trim());
  };
}

/**
 * @name Pattern
 * @description The base class for TypeNamePattern and FieldNamePattern
 * @see {@link url TypeNamePattern}
 * @see {@link url FieldNamePattern}
 */
export class Pattern {
  private _value: string;

  protected constructor(value: string) {
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  protected static fromString = (value: string) => {
    if (value === undefined || value.length < 1) {
      throw new Error('Pattern cannot be created from an empty string');
    }

    return new Pattern(value.endsWith(';') ? value : `${value};`);
  };

  // #region attemptMatchAndConfigure
  static attemptMatchAndConfigure = (
    pattern: FieldNamePattern,
    typeName: TypeName,
    fieldName?: FieldName,
  ) => {
    if (pattern.value.split(';').filter(_pattern => _pattern.length > 0).length !== 1) {
      throw new Error(
        'attemptMatchAndConfigure can only handle one pattern at a time... use the `splitPatterns(...)` helper function to split your patterns into a list and loop over the list calling the `attemptMatchAndConfigure(...)`  for each single pattern',
      );
    }

    const isTypeNamePattern = (baseName: string): boolean => {
      if (
        fieldName === undefined &&
        (baseName === 'TypeNames' ||
          baseName === 'AllTypeNames' ||
          baseName === 'AllTypeNamesExcludeTypeNames')
      ) {
        return true;
      }
      return false;
    };

    const regexpFor = (baseName: string): RegExp => {
      return isTypeNamePattern(baseName)
        ? TypeNamePattern[`regexpFor${baseName}`]
        : FieldNamePattern[`regexpFor${baseName}`];
    };

    const matchAndConfigure = (
      baseName: string,
      pattern: FieldNamePattern,
      ...args: (TypeName | FieldName)[]
    ): MatchAndConfigure | undefined => {
      return isTypeNamePattern(baseName)
        ? TypeNamePattern[`matchAndConfigure${baseName}`](pattern, ...args)
        : FieldNamePattern[`matchAndConfigure${baseName}`](pattern, ...args); // check if fieldName is passed in ...args
    };

    const matchList: string[] = Pattern.getMatchList(
      fieldName === undefined ? 'TypeNamePattern' : 'FieldNamePattern',
    );
    for (let i = 0; i < matchList.length; i++) {
      const baseName = matchList[i];

      if (regexpFor(baseName).test(pattern.value)) {
        return matchAndConfigure(baseName, pattern, typeName, fieldName);
      }
    }

    return undefined;
  };
  //#endregion

  //#region composePatterns
  static compose = (data: Pattern[]): Pattern => {
    if (data.length < 1) {
      throw new Error('Pattern cannot be created... an empty array was passed as parameter');
    }

    return Pattern.fromString(data.map(pattern => pattern.value).join(''));
  };
  //#endregion

  //#region split
  static split = (pattern: Pattern): Pattern[] => {
    return pattern.value
      .split(';')
      .filter(_pattern => _pattern.length > 0)
      .map(_pattern => Pattern.fromString(_pattern));
  };
  //#endregion

  //#region helper methods
  static getMatchList = (patternType: 'TypeNamePattern' | 'FieldNamePattern' | 'Pattern') => {
    const baseNamesForTypeNamePattern = Object.getOwnPropertyNames(TypeNamePattern)
      .filter(property => TypeNamePattern[property] instanceof RegExp)
      .map(regexpForName => regexpForName.slice(9));

    const baseNamesForFieldNamePattern = Object.getOwnPropertyNames(FieldNamePattern)
      .filter(property => FieldNamePattern[property] instanceof RegExp)
      .map(regexpForName => regexpForName.slice(9));

    return patternType === 'TypeNamePattern'
      ? baseNamesForTypeNamePattern
      : patternType === 'FieldNamePattern'
      ? baseNamesForFieldNamePattern
      : [...baseNamesForTypeNamePattern, ...baseNamesForFieldNamePattern];
  };
  //#endregion

  /**
   * finds the last pattern that configures the typeName and/or fieldName given
   * @param pattern
   * @param typeName
   * @param fieldName
   * @returns true if a pattern marks the typeName and or fieldName given to be configured, otherwise false
   */
  static findLastConfiguration = (
    pattern: Pattern,
    typeName: TypeName,
    fieldName?: FieldName,
  ): boolean => {
    const key = fieldName ? `${typeName.value}.${fieldName.value}` : typeName.value;
    return Pattern.split(pattern)
      .map(pattern => {
        const result = Pattern.attemptMatchAndConfigure(pattern, typeName, fieldName);
        return result?.[key]?.shouldBeConfigured;
      })
      .filter(value => value !== undefined)
      .reduce((_acc, value) => value, false);
  };
}

/**
 *  @name TypeNamePattern
 *
 * @description A compact string of patterns used in the config for granular configuration of Graphql Types.
 *
 * The string can contain one or more patterns, each pattern ends with a semi-colon (`;`).
 *
 * To apply an option to all Graphql Types or all fields, use the allTypeNames (`@*TypeNames`) tokens.
 *
 * Wherever you use the allTypeNames token, know very well that you can make some exceptions. After all, to every rule, there is an exception.
 *
 * A **square bracket** (`[]`) is used to specify what should be included and a **negated square bracket** (`-[]`) is used to specify what should be excluded.
 *
 * Manually typing out a pattern may be prone to typos resulting in invalid patterns therefore the [`TypeNamePattern`]() class exposes some builder methods to be used in the plugin config file.
 *
 * ## Available Builder Methods and the patterns they make
 * ```ts
 * const Droid = TypeName.fromString('Droid');
 * const Starship = TypeName.fromString('Starship');
 * const Human = TypeName.fromString('Human');
 * const Movie = TypeName.fromString('Movie');

 *
 * // Configuring specific Graphql Types
 * const pattern = TypeNamePattern.forTypeNames([Droid, Starship]);
 * console.log(pattern); // "Droid;Starship;"
 *
 * // Configuring all Graphql Types
 * const pattern = TypeNamePattern.forAllTypeNames();
 * console.log(pattern); // "@*TypeNames;"

 * // Configuring all Graphql Types except those specified in the exclusion list of TypeNames
 * const pattern = TypeNamePattern.forAllTypeNamesExcludeTypeNames([Droid, Starship]);
 * console.log(pattern); // "@*TypeNames-[Droid,Starship];"
 *
 */

export class TypeNamePattern extends Pattern {
  private constructor(value: string) {
    super(value);
  }

  //#region `'TypeName;AnotherTypeName;'`
  static forTypeNames = (typeNames: TypeNames): TypeNamePattern => {
    typeNames = arrayWrap(typeNames);

    if (typeNames.length < 1) {
      throw new Error('Pattern cannot be created... No TypeNames were specified');
    }

    return TypeNamePattern.fromString(
      arrayWrap(typeNames)
        .map(typeName => `${typeName.value};`)
        .join(''),
    );
  };

  static regexpForTypeNames = /\b(?!TypeNames|FieldNames\b)(?<typeName>\w+;)/gim; // TODO: fix this: regexp.test('@*TypeName;') returns true which shouldn't happen

  static matchAndConfigureTypeNames = (
    pattern: TypeNamePattern,
    typeName: TypeName,
  ): MatchAndConfigure => {
    const regexp = TypeNamePattern.regexpForTypeNames;
    resetIndex(regexp);

    let result: RegExpExecArray | null;

    const matchAndConfigure: MatchAndConfigure = {};

    while ((result = regexp.exec(pattern.value)) !== null) {
      const _typeName = result.groups.typeName.replace(';', '');

      const key = _typeName;
      const matchFound = _typeName === typeName.value;
      const shouldBeConfigured = matchFound;

      matchAndConfigure[key] = { matchFound, shouldBeConfigured };
    }

    resetIndex(regexp);
    return matchAndConfigure;
  };
  //#endregion

  //#region `'@*TypeNames;'`
  static forAllTypeNames = (): TypeNamePattern => Pattern.fromString(TypeName.allTypeNames);

  static regexpForAllTypeNames = /(?<allTypeNames>@\*TypeNames;)/gim;

  static matchAndConfigureAllTypeNames = (
    pattern: TypeNamePattern,
    typeName: TypeName,
  ): MatchAndConfigure => {
    const regexp = TypeNamePattern.regexpForAllTypeNames;
    resetIndex(regexp);

    const matchAndConfigure: MatchAndConfigure = {};

    const key = typeName.value;
    const matchFound = regexp.test(pattern.value);
    const shouldBeConfigured = matchFound;

    matchAndConfigure[key] = { matchFound, shouldBeConfigured };

    resetIndex(regexp);
    return matchAndConfigure;
  };
  //#endregion

  //#region `'@*TypeNames-[excludeTypeNames];'`
  static forAllTypeNamesExcludeTypeNames = (typeNames: TypeNames): TypeNamePattern => {
    typeNames = arrayWrap(typeNames);

    if (typeNames.length < 1) {
      throw new Error('Pattern cannot be created... No TypeNames were excluded');
    }

    const _typeNames = typeNames.map(typeName => typeName.value).join();

    return Pattern.fromString(`${TypeName.allTypeNames}-[${_typeNames}];`);
  };

  static regexpForAllTypeNamesExcludeTypeNames =
    /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\];/gim;

  static matchAndConfigureAllTypeNamesExcludeTypeNames = (
    pattern: TypeNamePattern,
    typeName: TypeName,
  ): MatchAndConfigure => {
    const regexp = TypeNamePattern.regexpForAllTypeNamesExcludeTypeNames;
    resetIndex(regexp);

    let result: RegExpExecArray | null;

    const matchAndConfigure: MatchAndConfigure = {};

    // typeNames that were excluded...
    while ((result = regexp.exec(pattern.value)) !== null) {
      const _typeNames = strToList(result.groups.typeNames);

      _typeNames.forEach(_typeName => {
        const key = _typeName;
        const matchFound = true;
        const shouldBeConfigured = false;

        matchAndConfigure[key] = { matchFound, shouldBeConfigured };
      });
    }

    // interpret global pattern: if typeName is not excluded ...
    const key = typeName.value;
    if (matchAndConfigure[key] === undefined) {
      matchAndConfigure[key] = { matchFound: false, shouldBeConfigured: true };
    }

    resetIndex(regexp);
    return matchAndConfigure;
  };
  //#endregion
}

/**
 *  @name FieldNamePattern
 *
 * @description A compact string of patterns used in the config for granular configuration the fields of a Graphql Type
 *
 * The string can contain one or more patterns, each pattern ends with a semi-colon (`;`).
 *
 * A dot (`.`) is used to separate the TypeName from the FieldNames in each pattern.
 *
 * To apply an option to all Graphql Types or all fields, use the allTypeNames (`@*TypeNames`) and allFieldNames (`@*FieldNames`) tokens respectively.
 *
 * Wherever you use the allTypeNames and the allFieldNames, know very well that you can make some exceptions. After all, to every rule, there is an exception.
 *
 * A **square bracket** (`[]`) is used to specify what should be included and a **negated square bracket** (`-[]`) is used to specify what should be excluded.
 *
 * Manually typing out a pattern may be prone to typos resulting in invalid patterns therefore the [`FieldName`]() class exposes some builder methods to be used in your plugin config file.
 *
 * ## Available Builder Methods and the patterns they make
 * ```ts
 * const Droid = TypeName.fromString('Droid');
 * const Starship = TypeName.fromString('Starship');
 * const Human = TypeName.fromString('Human');
 * const Movie = TypeName.fromString('Movie');
 *
 * const id = FieldName.fromString('id');
 * const name = FieldName.fromString('name');
 * const friends = FieldName.fromString('friends');
 * const friend = FieldName.fromString('friend');
 * const title = FieldName.fromString('title');
 * const episode = FieldName.fromString('episode');
 * const length = FieldName.fromString('length');
 *
 * // Configuring specific fields of a specific Graphql Type
 * const pattern = FieldNamePattern.forFieldNamesOfTypeName([
 *   [Droid, [id, name, friends]], // individual
 *   [Human, [id, name, title]], // individual
 *   [Starship, [name, length]], // individual
 * ]);
 * console.log(pattern); // "Droid.[id,name,friends];Human.[id,name,title];Starship.[name,length];"
 *
 * // Configuring all fields of a specific Graphql Type
 * const pattern = FieldNamePattern.forAllFieldNamesOfTypeName([Droid, Movie]);
 * console.log(pattern); // "Droid.@*FieldNames;Movie.@*FieldNames;"
 *
 * // Configuring all fields except those specified in the exclusion list of FieldNames for a specific GraphQL Type
 * const pattern = FieldNamePattern.forAllFieldNamesExcludeFieldNamesOfTypeName([
 *   [Droid, [id, name, friends]], // individual
 *   [Human, [id, name, title]], // individual
 *   [Starship, [name, length]], // individual
 * ]);
 * console.log(pattern); // "Droid.@*FieldNames-[id,name,friends];Human.@*FieldNames-[id,name,title];Starship.@*FieldNames-[name,length];"
 *
 * // Configuring specific fields of all Graphql Types
 * const pattern = FieldNamePattern.forFieldNamesOfAllTypeNames([id, name, friends]);
 * console.log(pattern); // "@*TypeNames.[id,name,friends];"
 *
 * // Configuring all fields of all Graphql Types
 * const pattern = FieldNamePattern.forAllFieldNamesOfAllTypeNames();
 * console.log(pattern); // "@*TypeNames.@*FieldNames;"
 *
 * // Configuring all fields except those specified in the exclusion list of FieldNames for all GraphQL Types
 * const pattern = FieldNamePattern.forAllFieldNamesExcludeFieldNamesOfAllTypeNames([id, name, friends]);
 * console.log(pattern); // "@*TypeNames.@*FieldNames-[id,name,friends];"
 *
 * // Configuring specific fields of all GraphQL Types except those specified in the exclusion list of TypeNames
 * const pattern = FieldNamePattern.forFieldNamesOfAllTypeNamesExcludeTypeNames([Droid, Human], [id, name, friends]);
 * console.log(pattern); // "@*TypeNames-[Droid,Human].[id,name,friends];"
 *
 * // Configuring all fields of all GraphQL Types except those specified in the exclusion list of TypeNames
 * const pattern = FieldNamePattern.forAllFieldNamesOfAllTypeNamesExcludeTypeNames([Droid, Human]);
 * console.log(pattern); // "@*TypeNames-[Droid,Human].@*FieldNames;"
 *
 * // Configuring all fields except those specified in the exclusion list of FieldNames of all GraphQL Types except those specified in the exclusion list of TypeNames
 * const pattern = FieldNamePattern.forAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames(
 *   [Droid, Human],
 *   [id, name, friends]
 * );
 * console.log(pattern); // "@*TypeNames-[Droid,Human].@*FieldNames-[id,name,friends];"
 * ```
 *
 */

export class FieldNamePattern extends Pattern {
  private constructor(value: string) {
    super(value);
  }

  //#region `'TypeName.[fieldNames];'`
  static forFieldNamesOfTypeName = (
    data: [typeNames: TypeNames, fieldNames: FieldNames][],
  ): FieldNamePattern => {
    const expandedPattern: Record<string, FieldName[]> = {};

    if (data.length < 1) {
      throw new Error('Pattern cannot be created... an empty array was passed as parameter');
    }

    data.forEach(([typeNames, fieldNames]) => {
      const _typeNames = arrayWrap(typeNames);
      const _fieldNames = arrayWrap(fieldNames);

      if (_typeNames.length < 1) {
        throw new Error('Pattern cannot be created... No TypeNames were specified');
      } else if (_fieldNames.length < 1) {
        throw new Error('Pattern cannot be created... No FieldNames were specified');
      }

      _typeNames.forEach(typeName => {
        expandedPattern[typeName.value] = [
          ...(expandedPattern[typeName.value] ?? []),
          ..._fieldNames,
        ];
      });
    });

    return FieldNamePattern.fromString(
      Object.keys(expandedPattern)
        .map(_typeName => {
          const _fieldNames = expandedPattern[_typeName].map(fieldName => fieldName.value).join();
          return `${_typeName}.[${_fieldNames}];`;
        })
        .join(''),
    );
  };

  static regexpForFieldNamesOfTypeName =
    /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchAndConfigureFieldNamesOfTypeName = (
    pattern: FieldNamePattern,
    typeName: TypeName,
    fieldName: FieldName,
  ): MatchAndConfigure => {
    const regexp = FieldNamePattern.regexpForFieldNamesOfTypeName;
    resetIndex(regexp);

    let result: RegExpExecArray | null;
    const matchAndConfigure: MatchAndConfigure = {};

    // typeName and fieldNames that were specified in the pattern
    while ((result = regexp.exec(pattern.value)) !== null) {
      const _typeName = result.groups.typeName;
      const _fieldNames = strToList(result.groups.fieldNames);

      _fieldNames.forEach(_fieldName => {
        const key = `${_typeName}.${_fieldName}`;
        const matchFound = true;
        const shouldBeConfigured = true;

        matchAndConfigure[key] = { matchFound, shouldBeConfigured };
      });
    }

    resetIndex(regexp);
    return matchAndConfigure;
  };
  //#endregion

  //#region `'TypeName.@*FieldNames;'`
  static forAllFieldNamesOfTypeName = (typeNames: TypeNames): FieldNamePattern => {
    const _typeNames = arrayWrap(typeNames);

    if (_typeNames.length < 1) {
      throw new Error('Pattern cannot be created... No TypeNames were specified');
    }

    return FieldNamePattern.fromString(
      _typeNames.map(_typeName => `${_typeName.value}.${FieldName.allFieldNames};`).join(''),
    );
  };

  static regexpForAllFieldNamesOfTypeName =
    /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.@\*FieldNames;/gim;

  static matchAndConfigureAllFieldNamesOfTypeName = (
    pattern: FieldNamePattern,
    typeName: TypeName,
    fieldName: FieldName,
  ): MatchAndConfigure => {
    const regexp = FieldNamePattern.regexpForAllFieldNamesOfTypeName;
    resetIndex(regexp);

    let result: RegExpExecArray | null;
    const matchAndConfigure: MatchAndConfigure = {};

    while ((result = regexp.exec(pattern.value)) !== null) {
      const _typeName = result.groups.typeName;

      const key = `${_typeName}.${fieldName.value}`;
      const matchFound = true;
      const shouldBeConfigured = true;

      matchAndConfigure[key] = { matchFound, shouldBeConfigured };
    }

    resetIndex(regexp);
    return matchAndConfigure;
  };
  //#endregion

  //#region `'TypeName.@*FieldNames-[excludeFieldNames];'`
  static forAllFieldNamesExcludeFieldNamesOfTypeName = (
    data: [typeNames: TypeNames, fieldNames: FieldNames][],
  ): FieldNamePattern => {
    const expandedPattern: Record<string, FieldName[]> = {};

    if (data.length < 1) {
      throw new Error('Pattern cannot be created... an empty array was passed as parameter');
    }

    data.forEach(([typeNames, fieldNames]) => {
      const _typeNames = arrayWrap(typeNames);
      const _fieldNames = arrayWrap(fieldNames);

      if (_typeNames.length < 1) {
        throw new Error('Pattern cannot be created... No TypeNames were specified');
      } else if (_fieldNames.length < 1) {
        throw new Error('Pattern cannot be created... No FieldNames were specified');
      }

      _typeNames.forEach(typeName => {
        expandedPattern[typeName.value] = [
          ...(expandedPattern[typeName.value] ?? []),
          ..._fieldNames,
        ];
      });
    });

    return FieldNamePattern.fromString(
      Object.keys(expandedPattern)
        .map(_typeName => {
          const _fieldNames = expandedPattern[_typeName].map(fieldName => fieldName.value).join();
          return `${_typeName}.${FieldName.allFieldNames}-[${_fieldNames}];`;
        })
        .join(''),
    );
  };

  static regexpForAllFieldNamesExcludeFieldNamesOfTypeName =
    /(?<typeName>\w+\s*)(?<!\s*@\s*\*\s*TypeNames\s*)\.@\*FieldNames-\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchAndConfigureAllFieldNamesExcludeFieldNamesOfTypeName = (
    pattern: FieldNamePattern,
    typeName: TypeName,
    fieldName: FieldName,
  ): MatchAndConfigure => {
    const regexp = FieldNamePattern.regexpForAllFieldNamesExcludeFieldNamesOfTypeName;
    resetIndex(regexp);

    let result: RegExpExecArray | null;
    const matchAndConfigure: MatchAndConfigure = {};

    // typeName.fieldName that was excluded...
    while ((result = regexp.exec(pattern.value)) !== null) {
      const _typeName = result.groups.typeName;
      const _fieldNames = strToList(result.groups.fieldNames);

      _fieldNames.forEach(_fieldName => {
        const key = `${_typeName}.${_fieldName}`;
        const matchFound = true;
        const shouldBeConfigured = false;

        matchAndConfigure[key] = { matchFound, shouldBeConfigured };
      });

      // interpret global pattern: typeName.fieldName that was included
      const key = `${_typeName}.${fieldName.value}`;
      if (matchAndConfigure[key] === undefined) {
        matchAndConfigure[key] = { matchFound: false, shouldBeConfigured: true };
      }
    }

    resetIndex(regexp);
    return matchAndConfigure;
  };
  //#endregion

  //#region `'@*TypeNames.[fieldNames];'`
  static forFieldNamesOfAllTypeNames = (fieldNames: FieldNames): FieldNamePattern => {
    fieldNames = arrayWrap(fieldNames);

    if (fieldNames.length < 1) {
      throw new Error('Pattern cannot be created... No FieldNames were specified');
    }

    const _fieldNames = fieldNames.map(fieldName => fieldName.value).join();

    return FieldNamePattern.fromString(`${TypeName.allTypeNames}.[${_fieldNames}];`);
  };

  static regexpForFieldNamesOfAllTypeNames = /@\*TypeNames\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchAndConfigureFieldNamesOfAllTypeNames = (
    pattern: FieldNamePattern,
    typeName: TypeName,
    fieldName: FieldName,
  ): MatchAndConfigure => {
    const regexp = FieldNamePattern.regexpForFieldNamesOfAllTypeNames;
    resetIndex(regexp);

    let result: RegExpExecArray | null;

    const matchAndConfigure: MatchAndConfigure = {};

    while ((result = regexp.exec(pattern.value)) !== null) {
      const _fieldNames = strToList(result.groups.fieldNames);

      _fieldNames.forEach(_fieldName => {
        const key = `${typeName.value}.${_fieldName}`;
        const matchFound = true;
        const shouldBeConfigured = true;
        matchAndConfigure[key] = { matchFound, shouldBeConfigured };
      });
    }

    resetIndex(regexp);
    return matchAndConfigure;
  };
  //#endregion

  //#region `'@*TypeNames.@*FieldNames;'`
  static forAllFieldNamesOfAllTypeNames = (): FieldNamePattern => {
    return FieldNamePattern.fromString(`${TypeName.allTypeNames}.${FieldName.allFieldNames};`);
  };

  static regexpForAllFieldNamesOfAllTypeNames = /@\*TypeNames\.@\*FieldNames;/gim;

  static matchAndConfigureAllFieldNamesOfAllTypeNames = (
    pattern: FieldNamePattern,
    typeName: TypeName,
    fieldName: FieldName,
  ): MatchAndConfigure => {
    const regexp = FieldNamePattern.regexpForAllFieldNamesOfAllTypeNames;
    resetIndex(regexp);

    const matchAndConfigure: MatchAndConfigure = {};

    const key = `${typeName.value}.${fieldName.value}`;
    const matchFound = regexp.test(pattern.value);
    const shouldBeConfigured = matchFound;

    matchAndConfigure[key] = { matchFound, shouldBeConfigured };

    resetIndex(regexp);
    return matchAndConfigure;
  };
  //#endregion

  //#region `'@*TypeNames.@*FieldNames-[excludeFieldNames];'`
  static forAllFieldNamesExcludeFieldNamesOfAllTypeNames = (
    fieldNames: FieldNames,
  ): FieldNamePattern => {
    fieldNames = arrayWrap(fieldNames);

    if (fieldNames.length < 1) {
      throw new Error('Pattern cannot be created... No FieldNames were excluded');
    }

    const _fieldNames = fieldNames.map(fieldName => fieldName.value).join();

    return FieldNamePattern.fromString(
      `${TypeName.allTypeNames}.${FieldName.allFieldNames}-[${_fieldNames}];`,
    );
  };

  static regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNames =
    /@\*TypeNames\.@\*FieldNames-\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNames = (
    pattern: FieldNamePattern,
    typeName: TypeName,
    fieldName: FieldName,
  ): MatchAndConfigure => {
    const regexp = FieldNamePattern.regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNames;
    resetIndex(regexp);

    let result: RegExpExecArray | null;
    const matchAndConfigure: MatchAndConfigure = {};

    while ((result = regexp.exec(pattern.value)) !== null) {
      const _fieldNames = strToList(result.groups.fieldNames);

      // typeName.fieldName that was excluded...
      _fieldNames.forEach(_fieldName => {
        const key = `${typeName.value}.${_fieldName}`;
        const matchFound = true;
        const shouldBeConfigured = false;

        matchAndConfigure[key] = { matchFound, shouldBeConfigured };
      });
    }

    // interpret global pattern: typeName.fieldName that was included...
    const key = `${typeName.value}.${fieldName.value}`;
    if (matchAndConfigure[key] === undefined) {
      matchAndConfigure[key] = { matchFound: false, shouldBeConfigured: true };
    }

    resetIndex(regexp);
    return matchAndConfigure;
  };
  //#endregion

  //#region `'@*TypeNames-[excludeTypeNames].[fieldNames];'`
  static forFieldNamesOfAllTypeNamesExcludeTypeNames = (
    typeNames: TypeNames,
    fieldNames: FieldNames,
  ): FieldNamePattern => {
    typeNames = arrayWrap(typeNames);
    fieldNames = arrayWrap(fieldNames);

    if (typeNames.length < 1) {
      throw new Error('Pattern cannot be created... No TypeNames were excluded');
    } else if (fieldNames.length < 1) {
      throw new Error('Pattern cannot be created... No FieldNames were specified');
    }

    const _typeNames = typeNames.map(typeName => typeName.value).join();
    const _fieldNames = fieldNames.map(fieldName => fieldName.value).join();

    return FieldNamePattern.fromString(
      `${TypeName.allTypeNames}-[${_typeNames}].[${_fieldNames}];`,
    );
  };

  static regexpForFieldNamesOfAllTypeNamesExcludeTypeNames =
    /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\]\.\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchAndConfigureFieldNamesOfAllTypeNamesExcludeTypeNames = (
    pattern: FieldNamePattern,
    typeName: TypeName,
    fieldName: FieldName,
  ): MatchAndConfigure => {
    const regexp = FieldNamePattern.regexpForFieldNamesOfAllTypeNamesExcludeTypeNames;
    resetIndex(regexp);

    let result: RegExpExecArray | null;
    const matchAndConfigure: MatchAndConfigure = {};

    while ((result = regexp.exec(pattern.value)) !== null) {
      const _typeNames = strToList(result.groups.typeNames);
      const _fieldNames = strToList(result.groups.fieldNames);

      // typeName.fieldName that was excluded
      _typeNames.forEach(_typeName =>
        _fieldNames.forEach(_fieldName => {
          const key = `${_typeName}.${_fieldName}`;
          const matchFound = true;
          const shouldBeConfigured = false;

          matchAndConfigure[key] = { matchFound, shouldBeConfigured };
        }),
      );

      // interpret the global pattern:
      // for fieldNames specified in the list of fieldNames for other typeNames not specified in the exclusion list of TypeNames
      _fieldNames.forEach(_fieldName => {
        const key = `${typeName.value}.${_fieldName}`;
        if (!_typeNames.includes(typeName.value) && matchAndConfigure[key] === undefined) {
          const matchFound = false;
          const shouldBeConfigured = true;

          matchAndConfigure[key] = { matchFound, shouldBeConfigured };
        }
      });
    }

    resetIndex(regexp);
    return matchAndConfigure;
  };
  //#endregion

  //#region `'@*TypeNames-[excludeTypeNames].@*FieldNames;'`
  static forAllFieldNamesOfAllTypeNamesExcludeTypeNames = (
    typeNames: TypeNames,
  ): FieldNamePattern => {
    typeNames = arrayWrap(typeNames);

    if (typeNames.length < 1) {
      throw new Error('Pattern cannot be created... No TypeNames were excluded');
    }

    const _typeNames = typeNames.map(typeName => typeName.value).join();

    return FieldNamePattern.fromString(
      `${TypeName.allTypeNames}-[${_typeNames}].${FieldName.allFieldNames};`,
    );
  };

  static regexpForAllFieldNamesOfAllTypeNamesExcludeTypeNames =
    /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\]\.@\*FieldNames;/gim;

  static matchAndConfigureAllFieldNamesOfAllTypeNamesExcludeTypeNames = (
    pattern: FieldNamePattern,
    typeName: TypeName,
    fieldName: FieldName,
  ): MatchAndConfigure => {
    const regexp = FieldNamePattern.regexpForAllFieldNamesOfAllTypeNamesExcludeTypeNames;
    resetIndex(regexp);

    let result: RegExpExecArray | null;
    const matchAndConfigure: MatchAndConfigure = {};

    while ((result = regexp.exec(pattern.value)) !== null) {
      const _typeNames = strToList(result.groups.typeNames);

      _typeNames.forEach(_typeName => {
        const key = `${_typeName}.${fieldName.value}`;
        const matchFound = true;
        const shouldBeConfigured = false;

        matchAndConfigure[key] = { matchFound, shouldBeConfigured };
      });

      // interpret the global pattern:
      // for all other typeName.fieldName combination where the typeName is not in the exclusion list of TypeNames
      const key = `${typeName.value}.${fieldName.value}`;
      if (matchAndConfigure[key] === undefined) {
        matchAndConfigure[key] = { matchFound: false, shouldBeConfigured: true };
      }
    }

    resetIndex(regexp);
    return matchAndConfigure;
  };
  //#endregion

  //#region `'@*TypeNames-[excludeTypeNames].@*FieldNames-[excludeFieldNames];'`
  static forAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames = (
    typeNames: TypeNames,
    fieldNames: FieldNames,
  ): FieldNamePattern => {
    typeNames = arrayWrap(typeNames);
    fieldNames = arrayWrap(fieldNames);

    if (typeNames.length < 1) {
      throw new Error('Pattern cannot be created... No TypeNames were excluded');
    } else if (fieldNames.length < 1) {
      throw new Error('Pattern cannot be created... No FieldNames were excluded');
    }

    const _typeNames = typeNames.map(typeName => typeName.value).join();
    const _fieldNames = fieldNames.map(fieldName => fieldName.value).join();

    return FieldNamePattern.fromString(
      `${TypeName.allTypeNames}-[${_typeNames}].${FieldName.allFieldNames}-[${_fieldNames}];`,
    );
  };

  static regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames =
    /@\*TypeNames-\[\s*(?<typeNames>(\w+,?\s*)*)\]\.@\*FieldNames-\[\s*(?<fieldNames>(\w+,?\s*)*)\];/gim;

  static matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames = (
    pattern: FieldNamePattern,
    typeName: TypeName,
    fieldName: FieldName,
  ): MatchAndConfigure => {
    const regexp =
      FieldNamePattern.regexpForAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames;
    resetIndex(regexp);

    let result: RegExpExecArray | null;
    const matchAndConfigure: MatchAndConfigure = {};

    while ((result = regexp.exec(pattern.value)) !== null) {
      const _typeNames = strToList(result.groups.typeNames);
      const _fieldNames = strToList(result.groups.fieldNames);

      _typeNames.forEach(_typeName =>
        _fieldNames.forEach(_fieldName => {
          const key = `${_typeName}.${_fieldName}`;
          const matchFound = true;
          const shouldBeConfigured = false;

          matchAndConfigure[key] = { matchFound, shouldBeConfigured };
        }),
      );
    }

    // interpret the global pattern
    // for any other typeName.fieldName combination which is not excluded in the pattern
    const key = `${typeName.value}.${fieldName.value}`;
    if (matchAndConfigure[key] === undefined) {
      matchAndConfigure[key] = { matchFound: false, shouldBeConfigured: true };
    }

    resetIndex(regexp);
    return matchAndConfigure;
  };
  //#endregion
}

export type MatchAndConfigure = Record<
  string,
  { matchFound: boolean; shouldBeConfigured: boolean }
>;

// type MatchAndConfigure =
//   | 'matchAndConfigureTypeNames'
//   | 'matchAndConfigureAllTypeNames'
//   | 'matchAndConfigureAllTypeNamesExcludeTypeNames'
//   | 'matchAndConfigureFieldNamesOfTypeName'
//   | 'matchAndConfigureAllFieldNamesOfTypeName'
//   | 'matchAndConfigureAllFieldNamesExcludeFieldNamesOfTypeName'
//   | 'matchAndConfigureFieldNamesOfAllTypeNames'
//   | 'matchAndConfigureAllFieldNamesOfAllTypeNames'
//   | 'matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNames'
//   | 'matchAndConfigureFieldNamesOfAllTypeNamesExcludeTypeNames'
//   | 'matchAndConfigureAllFieldNamesOfAllTypeNamesExcludeTypeNames'
//   | 'matchAndConfigureAllFieldNamesExcludeFieldNamesOfAllTypeNamesExcludeTypeNames';
