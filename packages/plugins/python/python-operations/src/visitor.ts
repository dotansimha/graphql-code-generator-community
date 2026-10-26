import {
  getNamedType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLSchema,
  isEnumType,
  isInterfaceType,
  isListType,
  isNonNullType,
  isObjectType,
  isScalarType,
  Kind,
  OperationDefinitionNode,
  SelectionSetNode,
  TypeNode,
  VariableDefinitionNode,
} from 'graphql';
import { BaseVisitor, getConfigValue } from '@graphql-codegen/visitor-plugin-common';
import { PythonOperationsPluginConfig } from './config.js';
import {
  isValidClassAttr,
  PYTHON_SCALARS,
  PythonNamingConvention,
  resultFieldKey,
} from './python-helpers.js';

const INDENT = '    ';

/** GraphQL parent object/interface types can carry field definitions. */
type SelectableType = GraphQLObjectType | GraphQLInterfaceType;

/**
 * A single class / `TypedDict` entry. `wire` is the response key on the wire and
 * is set for result fields — when it differs from `key` the field is pinned with
 * a pydantic `Field(alias=...)`. Variables entries leave it undefined.
 */
interface PyField {
  key: string;
  annotation: string;
  wire?: string;
}

/**
 * Walks GraphQL `OperationDefinition` nodes against the schema and recursively
 * emits named, nested Python `TypedDict` classes for every object selection set,
 * plus a `<Operation>Variables` `TypedDict` for the operation variables.
 *
 * Unlike the C-family `SelectionSetToObject`/`DeclarationBlock` approach (which
 * emits inline anonymous objects), this mirrors the C#/Java strategy: every
 * nested selection becomes its own named type referenced by its parent.
 */
export class PythonOperationsVisitor extends BaseVisitor<PythonOperationsPluginConfig, any> {
  private _schema: GraphQLSchema;
  private _typesImport?: string;
  private _namingConvention: PythonNamingConvention;
  private _baseModel: string;
  private _runtimeImport: string;
  private _usesOptional = false;
  private _usesAny = false;
  private _usesLiteral = false;
  private _usesBaseModel = false;
  private _usesConfigDict = false;
  private _usesField = false;
  private _anonymousCount = 0;

  constructor(schema: GraphQLSchema, rawConfig: PythonOperationsPluginConfig) {
    // Our `namingConvention` (`'keep'` | `'snakeCase'`) governs field-KEY naming
    // only. It must NOT leak into the base visitor's `namingConvention`, which
    // drives TYPE-name conversion (`convertName` / `pascal`) — those names must
    // stay PascalCase (e.g. `GetUsersQueryUsers`).
    super({ ...rawConfig, namingConvention: undefined }, {});
    this._schema = schema;
    this._typesImport = rawConfig.typesImport;
    this._namingConvention = getConfigValue(
      rawConfig.namingConvention,
      'snakeCase',
    ) as PythonNamingConvention;
    this._baseModel = getConfigValue(rawConfig.baseModel, 'BaseModel') as string;
    this._runtimeImport = getConfigValue(rawConfig.runtimeImport, 'pydantic') as string;
  }

  /** PascalCase a name segment without applying any prefix/suffix. */
  private pascal(name: string): string {
    return this.convertName(name, {
      useTypesPrefix: false,
      useTypesSuffix: false,
    });
  }

  private get operationRootTypes(): Record<string, SelectableType | null | undefined> {
    return {
      query: this._schema.getQueryType(),
      mutation: this._schema.getMutationType(),
      subscription: this._schema.getSubscriptionType(),
    };
  }

  // --- Python annotation builders ----------------------------------------

  /**
   * Build a Python annotation from a (resolved) GraphQL output type. The
   * `objectBaseName` is the generated nested type name used when the base type
   * is an object/interface/union selection.
   */
  private pyTypeFromGraphQL(type: GraphQLOutputType, objectBaseName: string): string {
    if (isNonNullType(type)) {
      return this.innerFromGraphQL(type.ofType, objectBaseName);
    }
    this._usesOptional = true;
    return `Optional[${this.innerFromGraphQL(type, objectBaseName)}]`;
  }

  private innerFromGraphQL(type: GraphQLOutputType, objectBaseName: string): string {
    if (isListType(type)) {
      return `list[${this.pyTypeFromGraphQL(type.ofType, objectBaseName)}]`;
    }
    const named = getNamedType(type);
    if (isScalarType(named)) {
      const mapped = PYTHON_SCALARS[named.name];
      if (mapped) {
        return mapped.output;
      }
      this._usesAny = true;
      return 'Any';
    }
    if (isEnumType(named)) {
      return named.name;
    }
    // object / interface / union selection -> generated nested type name
    return objectBaseName;
  }

  /**
   * Build a Python annotation from a variable `TypeNode`. Named types resolve
   * to mapped scalars, or the bare base type name (enums / input objects).
   */
  private pyTypeFromTypeNode(type: TypeNode): string {
    if (type.kind === Kind.NON_NULL_TYPE) {
      return this.innerFromTypeNode(type.type);
    }
    this._usesOptional = true;
    return `Optional[${this.innerFromTypeNode(type)}]`;
  }

  private innerFromTypeNode(type: TypeNode): string {
    if (type.kind === Kind.LIST_TYPE) {
      return `list[${this.pyTypeFromTypeNode(type.type)}]`;
    }
    if (type.kind === Kind.NON_NULL_TYPE) {
      // Non-null base (e.g. inside a list) — no Optional wrapper.
      return this.innerFromTypeNode(type.type);
    }
    // NamedType
    const name = type.name.value;
    const mapped = PYTHON_SCALARS[name];
    if (mapped) {
      return mapped.input;
    }
    const schemaType = this._schema.getType(name);
    if (schemaType && isScalarType(schemaType)) {
      this._usesAny = true;
      return 'Any';
    }
    // enum or input object -> bare name (quoted forward ref by caller)
    return name;
  }

  // --- Class builders ----------------------------------------------------

  /**
   * Build a variables `TypedDict`. Variable keys are ALWAYS the wire (GraphQL)
   * name — they are sent to the server as-is. If every key is a valid Python
   * attribute the readable class syntax is used; otherwise (a key is a keyword /
   * non-identifier) the functional `TypedDict('Name', { 'key': '...' })` syntax
   * is emitted so the offending keys remain valid.
   */
  private buildVariablesClass(name: string, fields: PyField[]): string {
    if (fields.length === 0) {
      return `class ${name}(TypedDict):\n${INDENT}pass`;
    }
    const needsFunctional = fields.some(f => !isValidClassAttr(f.key));
    if (needsFunctional) {
      const entries = fields.map(f => `${INDENT}'${f.key}': '${f.annotation}',`);
      return [`${name} = TypedDict('${name}', {`, ...entries, '})'].join('\n');
    }
    const lines = fields.map(f => `${INDENT}${f.key}: '${f.annotation}'`);
    return [`class ${name}(TypedDict):`, ...lines].join('\n');
  }

  /**
   * Emit the per-class `__init__` that pre-maps wire keys to their escaped
   * attribute names before delegating to the base model. Only emitted for result
   * classes that contain keyword fields.
   */
  /**
   * Render a single result field line: `key: 'annotation'`, with a pydantic
   * `Field(alias=...)` when the Python attribute differs from the wire response
   * key, and a `None` default for optional fields.
   */
  private renderResultField(field: PyField): string {
    const optional = field.annotation.startsWith('Optional[');
    let assignment = '';
    if (field.wire !== undefined && field.key !== field.wire) {
      this._usesField = true;
      assignment = optional
        ? ` = Field(default=None, alias='${field.wire}')`
        : ` = Field(alias='${field.wire}')`;
    } else if (optional) {
      assignment = ' = None';
    }
    return `${field.key}: '${field.annotation}'${assignment}`;
  }

  /**
   * Build a result base-model subclass. A field whose Python attribute differs
   * from the wire key is pinned with `Field(alias=...)`, and a
   * `model_config = ConfigDict(populate_by_name=True)` line is prepended so such
   * classes can also be built by attribute name.
   */
  private buildResultClass(name: string, fields: PyField[]): string {
    this._usesBaseModel = true;
    const header = `class ${name}(${this._baseModel}):`;
    if (fields.length === 0) {
      return `${header}\n${INDENT}pass`;
    }
    const lines = [header];
    if (fields.some(f => f.wire !== undefined && f.key !== f.wire)) {
      this._usesConfigDict = true;
      lines.push(`${INDENT}model_config = ConfigDict(populate_by_name=True)`);
    }
    for (const field of fields) {
      lines.push(`${INDENT}${this.renderResultField(field)}`);
    }
    return lines.join('\n');
  }

  // --- Selection set walking ---------------------------------------------

  /**
   * Emit a `TypedDict` for `selectionSet` (a selection against `parentType`),
   * named `typeName`. Nested object selections are emitted FIRST (deepest
   * first) so references resolve top-to-bottom. Returns nothing; classes are
   * pushed onto `out`.
   */
  private processSelectionSet(
    parentType: SelectableType,
    selectionSet: SelectionSetNode,
    typeName: string,
    out: string[],
  ): void {
    const fields: PyField[] = [];

    const addField = (responseKey: string, annotation: string): void => {
      const key = resultFieldKey(responseKey, this._namingConvention);
      // Record the wire (response) key so a `Field(alias=...)` is emitted when
      // the Python attribute differs (snake_case conversion or keyword escape).
      fields.push({ key, annotation, wire: responseKey });
    };

    for (const selection of selectionSet.selections) {
      // Fragments (spread / inline) are not supported yet. Fail loudly instead
      // of silently omitting their fields, which would otherwise produce a
      // result type that looks valid but is missing data.
      if (selection.kind === Kind.FRAGMENT_SPREAD) {
        throw new Error(
          `@graphql-codegen/python-operations: fragment spread "...${selection.name.value}" on ` +
            `"${parentType.name}" is not supported yet. Inline the fragment's fields directly into ` +
            'the operation for now.',
        );
      }
      if (selection.kind === Kind.INLINE_FRAGMENT) {
        const onType = selection.typeCondition?.name.value ?? parentType.name;
        throw new Error(
          `@graphql-codegen/python-operations: inline fragment "... on ${onType}" on ` +
            `"${parentType.name}" is not supported yet. Union/interface member selections cannot ` +
            'be generated; select only common fields for now.',
        );
      }
      const fieldNode = selection;
      const fieldName = fieldNode.name.value;
      const responseKey = fieldNode.alias?.value ?? fieldName;

      if (fieldName === '__typename') {
        // `__typename` selections become a `Literal["ParentType"]` attribute.
        // pydantic forbids a leading-underscore field name, so the attribute is
        // `typename__` with `Field(alias='__typename')` pinning the wire key.
        this._usesLiteral = true;
        fields.push({
          key: 'typename__',
          annotation: `Literal["${parentType.name}"]`,
          wire: '__typename',
        });
        continue;
      }

      const fieldDef = parentType.getFields()[fieldName];
      if (!fieldDef) {
        // Unknown field (e.g. introspection on a type without it) — skip.
        continue;
      }

      const fieldType = fieldDef.type;
      const namedType = getNamedType(fieldType);

      if ((isObjectType(namedType) || isInterfaceType(namedType)) && fieldNode.selectionSet) {
        const nestedName = `${typeName}${this.pascal(responseKey)}`;
        // Recurse FIRST so deepest types are emitted before this one.
        this.processSelectionSet(
          namedType as SelectableType,
          fieldNode.selectionSet,
          nestedName,
          out,
        );
        addField(responseKey, this.pyTypeFromGraphQL(fieldType, nestedName));
      } else {
        // Scalar / enum leaf (or union without object handling).
        addField(responseKey, this.pyTypeFromGraphQL(fieldType, namedType.name));
      }
    }

    out.push(this.buildResultClass(typeName, fields));
  }

  private buildVariables(
    variableDefinitions: readonly VariableDefinitionNode[],
    variablesTypeName: string,
  ): string {
    const fields: PyField[] = variableDefinitions.map(def => {
      // Variable keys are ALWAYS the wire name (sent to the server as-is).
      const name = def.variable.name.value;
      const annotation = this.pyTypeFromTypeNode(def.type);
      return { key: name, annotation };
    });
    return this.buildVariablesClass(variablesTypeName, fields);
  }

  /** Generate all types for a single operation. Returns joined class blocks. */
  public generateOperation(operation: OperationDefinitionNode): string {
    const operationType = operation.operation; // 'query' | 'mutation' | 'subscription'
    const operationTypeName = operationType.charAt(0).toUpperCase() + operationType.slice(1);

    const operationName = operation.name?.value ?? `Anonymous${this._anonymousCount++}`;
    const baseName = `${this.pascal(operationName)}${operationTypeName}`;

    const rootType = this.operationRootTypes[operationType];
    const out: string[] = [];

    if (rootType) {
      this.processSelectionSet(rootType, operation.selectionSet, baseName, out);
    }

    out.push(this.buildVariables(operation.variableDefinitions ?? [], `${baseName}Variables`));

    return out.join('\n\n\n');
  }

  /** Build the `prepend` import lines, emitting only what is referenced. */
  public getImports(): string[] {
    const imports: string[] = [];

    const typingParts: string[] = [];
    if (this._usesOptional) {
      typingParts.push('Optional');
    }
    // Every operation emits at least a variables TypedDict.
    typingParts.push('TypedDict');
    if (this._usesLiteral) {
      typingParts.push('Literal');
    }
    if (this._usesAny) {
      typingParts.push('Any');
    }
    imports.push(`from typing import ${typingParts.join(', ')}`);

    if (this._usesBaseModel) {
      // `ConfigDict` / `Field` are pydantic names; emit them from the same module
      // as the base model, and only when the generated content uses them.
      const parts = [this._baseModel];
      if (this._usesConfigDict) {
        parts.push('ConfigDict');
      }
      if (this._usesField) {
        parts.push('Field');
      }
      imports.push(`from ${this._runtimeImport} import ${parts.join(', ')}`);
    }

    if (this._typesImport) {
      imports.push(`from ${this._typesImport} import *`);
    }

    return imports;
  }
}
