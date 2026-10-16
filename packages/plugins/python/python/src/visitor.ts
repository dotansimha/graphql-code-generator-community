import autoBind from 'auto-bind';
import {
  EnumTypeDefinitionNode,
  FieldDefinitionNode,
  GraphQLSchema,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  InterfaceTypeDefinitionNode,
  ListTypeNode,
  NamedTypeNode,
  NonNullTypeNode,
  ObjectTypeDefinitionNode,
  UnionTypeDefinitionNode,
} from 'graphql';
import { isValidClassAttr, PYTHON_SCALARS, pythonFieldName } from '@graphql-codegen/python-common';
import {
  BaseTypesVisitor,
  getConfigValue,
  ParsedTypesConfig,
} from '@graphql-codegen/visitor-plugin-common';
import { PythonPluginConfig } from './config.js';

export { PYTHON_SCALARS };

const INDENT = '    ';

export type PythonNamingConvention = 'keep' | 'snakeCase';

export interface PythonPluginParsedConfig extends ParsedTypesConfig {
  baseModel: string;
  runtimeImport: string;
  pyNamingConvention: PythonNamingConvention;
}

export class PythonVisitor<
  TRawConfig extends PythonPluginConfig = PythonPluginConfig,
  TParsedConfig extends PythonPluginParsedConfig = PythonPluginParsedConfig,
> extends BaseTypesVisitor<TRawConfig, TParsedConfig> {
  private _usesEnum = false;
  private _usesTypedDict = false;
  private _usesBaseModel = false;
  private _usesUnion = false;

  constructor(schema: GraphQLSchema, pluginConfig: TRawConfig) {
    // `namingConvention` here is our own field-naming option (`'keep'` |
    // `'snakeCase'`) and must NOT leak into the base visitor's `namingConvention`
    // (which controls TYPE-name conversion via `convertFactory`). Strip it before
    // calling `super` so type names keep their default (PascalCase) conversion.
    super(
      schema,
      // Route custom scalars (no explicit mapping) to `Any` instead of `unknown`.
      {
        ...pluginConfig,
        namingConvention: undefined,
        defaultScalarType: getConfigValue(pluginConfig.defaultScalarType, 'Any'),
      },
      {
        baseModel: getConfigValue(pluginConfig.baseModel, 'BaseModel'),
        runtimeImport: getConfigValue(pluginConfig.runtimeImport, 'pydantic'),
        pyNamingConvention: getConfigValue(pluginConfig.namingConvention, 'snakeCase'),
      } as TParsedConfig,
      PYTHON_SCALARS,
    );

    autoBind(this);
  }

  /** Python has no `export` keyword; disable the C-family export prefix. */
  protected getExportPrefix(): string {
    return '';
  }

  protected _getScalar(name: string, type: 'input' | 'output'): string {
    const mapped = this.scalars[name];
    if (mapped) {
      return mapped[type];
    }
    return 'Any';
  }

  // --- Nullability / list composition (emit Python instead of TS) ---

  NamedType(node: NamedTypeNode, key: any, parent: any, path: any, ancestors: any): string {
    return `Optional[${super.NamedType(node, key, parent, path, ancestors)}]`;
  }

  ListType(node: ListTypeNode, key: any, parent: any, path: any, ancestors: any): string {
    return `Optional[${super.ListType(node, key, parent, path, ancestors)}]`;
  }

  protected wrapWithListType(str: string): string {
    return `list[${str}]`;
  }

  NonNullType(node: NonNullTypeNode): string {
    const baseValue = super.NonNullType(node);
    if (baseValue.startsWith('Optional[') && baseValue.endsWith(']')) {
      return baseValue.slice('Optional['.length, -1);
    }
    return baseValue;
  }

  // --- Field rendering (name: 'annotation') ---

  private snakeFieldName(name: string): string {
    return pythonFieldName(name);
  }

  /**
   * Field key for a `TypedDict` (input type). Input types are what the caller
   * SENDS — the runtime forwards the dict to the server as-is — so they ALWAYS
   * keep the wire (GraphQL) name regardless of `namingConvention`. If the name
   * is a keyword / non-identifier the containing `TypedDict` is later emitted
   * with functional syntax (see `buildTypedDict`).
   */
  private dictFieldName(name: string): string {
    return name;
  }

  /**
   * Field key for an object / interface type (a class attribute). Under `'keep'`
   * a keyword / non-identifier name cannot be a class attribute and BaseModel
   * cannot use functional `TypedDict` syntax, so we fall back to appending `_`
   * for just that field.
   */
  private objectFieldName(name: string): string {
    if (this.config.pyNamingConvention === 'snakeCase') {
      return this.snakeFieldName(name);
    }
    return isValidClassAttr(name) ? name : `${name}_`;
  }

  FieldDefinition(node: FieldDefinitionNode): string {
    if (this.config.onlyEnums) return '';
    const wire = node.name.value;
    const attr = this.objectFieldName(wire);
    // The rendered annotation (e.g. `Optional[str]`, `list[User]`). Quoted below
    // so forward / recursive references resolve without ordering constraints.
    const annotation = node.type as unknown as string;
    const optional = annotation.startsWith('Optional[');
    // When the Python attribute differs from the GraphQL wire key (snake_case
    // conversion or a keyword escaped with `_`), pin the wire key with a pydantic
    // `Field(alias=...)` so hydration maps it onto the attribute. Optional fields
    // also default to `None` so a missing key is allowed.
    let assignment = '';
    if (attr !== wire) {
      assignment = optional
        ? ` = Field(default=None, alias='${wire}')`
        : ` = Field(alias='${wire}')`;
    } else if (optional) {
      assignment = ' = None';
    }
    return `${attr}: '${annotation}'${assignment}`;
  }

  InputValueDefinition(node: InputValueDefinitionNode): string {
    if (this.config.onlyEnums) return '';
    return `${this.dictFieldName(node.name.value)}: '${node.type as unknown as string}'`;
  }

  // --- Class / block builder ---

  private buildClass(name: string, base: string, fields: readonly string[]): string {
    const header = `class ${name}(${base}):`;
    const body = fields.filter(Boolean);
    if (body.length === 0) {
      return `${header}\n${INDENT}pass`;
    }
    return [header, ...body.map(f => INDENT + f)].join('\n');
  }

  /**
   * Build a base-model subclass. Fields are class-level annotations; if any field
   * pins a wire key with `Field(alias=...)`, a
   * `model_config = ConfigDict(populate_by_name=True)` line is prepended so the
   * class can be constructed by attribute name as well as by alias.
   */
  private buildBaseModelClass(name: string, fields: readonly string[]): string {
    const header = `class ${name}(${this.config.baseModel}):`;
    const body = fields.filter(Boolean);
    if (body.length === 0) {
      return `${header}\n${INDENT}pass`;
    }
    const lines = [header];
    if (body.some(f => f.includes('alias='))) {
      lines.push(`${INDENT}model_config = ConfigDict(populate_by_name=True)`);
    }
    lines.push(...body.map(f => INDENT + f));
    return lines.join('\n');
  }

  /**
   * Split a rendered `key: 'annotation'` field back into its parts. The key is
   * always a GraphQL Name (no `: '`) and the annotation is always single-quoted,
   * so splitting on the first `: '` is unambiguous.
   */
  private splitField(rendered: string): { key: string; annotation: string } {
    const sep = rendered.indexOf(": '");
    const key = rendered.slice(0, sep);
    const annotation = rendered.slice(sep + 3, -1);
    return { key, annotation };
  }

  /**
   * Build a `TypedDict`. If every key is a valid Python attribute, the readable
   * class syntax is used; otherwise (a key is a keyword / non-identifier under
   * `'keep'`) the functional `TypedDict('Name', { 'key': 'annotation' })` syntax
   * is emitted so the offending keys remain valid.
   */
  private buildTypedDict(name: string, fields: readonly string[]): string {
    const body = fields.filter(Boolean);
    const parsed = body.map(f => this.splitField(f));
    const needsFunctional = parsed.some(p => !isValidClassAttr(p.key));
    if (!needsFunctional) {
      return this.buildClass(name, 'TypedDict', body);
    }
    const entries = parsed.map(p => `${INDENT}'${p.key}': '${p.annotation}',`);
    return [`${name} = TypedDict('${name}', {`, ...entries, '})'].join('\n');
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode): string {
    if (this.config.onlyOperationTypes || this.config.onlyEnums) return '';
    if (node.name.value.startsWith('__')) return '';
    this._usesBaseModel = true;
    return this.buildBaseModelClass(this.convertName(node), node.fields as unknown as string[]);
  }

  InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode): string {
    if (this.config.onlyOperationTypes || this.config.onlyEnums) return '';
    if (node.name.value.startsWith('__')) return '';
    this._usesBaseModel = true;
    return this.buildBaseModelClass(this.convertName(node), node.fields as unknown as string[]);
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    if (this.config.onlyEnums) return '';
    if (node.name.value.startsWith('__')) return '';
    this._usesTypedDict = true;
    // Under `'keep'`, a keyword / non-identifier field key forces functional
    // `TypedDict` syntax; otherwise readable class syntax is used.
    return this.buildTypedDict(this.convertName(node), node.fields as unknown as string[]);
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    if (node.name.value.startsWith('__')) return '';
    this._usesEnum = true;
    const name = this.convertName(node, {
      useTypesPrefix: this.config.enumPrefix,
      useTypesSuffix: this.config.enumSuffix,
    });
    const members = (node.values ?? []).map(
      value => `${INDENT}${value.name.value} = '${value.name.value}'`,
    );
    const body = members.length > 0 ? members : [`${INDENT}pass`];
    return [`class ${name}(str, Enum):`, ...body].join('\n');
  }

  /** Scalars are handled inline via the scalar map; no standalone class. */
  ScalarTypeDefinition(): string {
    return '';
  }

  /**
   * `union Foo = A | B` -> `Foo = Union['A', 'B']`.
   *
   * Must be overridden: `BaseTypesVisitor`'s implementation emits TypeScript
   * (`export type Foo = A | B;`), and it dereferences the node description
   * unguarded, so an undocumented union crashes the generator outright. A schema
   * merely *containing* a union is enough to hit this, even when no operation
   * selects one.
   *
   * Member names come from `parent[key]` — the original, un-visited node — the
   * same way `typescript`'s visitor reads them. By `leave` time `node.types`
   * has already been rendered into annotations (`Optional[Foo]`) and would
   * otherwise be mangled. Members are quoted so a union declared before its
   * members still resolves, matching how every other annotation in this plugin
   * is emitted.
   *
   * Note this only makes a union *declaration* valid Python. Actually selecting
   * union members in an operation needs inline-fragment support, which
   * `python-operations` does not implement yet (it throws).
   */
  UnionTypeDefinition(
    node: UnionTypeDefinitionNode,
    key: string | number | undefined,
    parent: any,
  ): string {
    if (this.config.onlyOperationTypes || this.config.onlyEnums) return '';
    if (node.name.value.startsWith('__')) return '';

    const originalNode = parent[key] as UnionTypeDefinitionNode;
    const members = (originalNode.types ?? []).map(t => `'${this.convertName(t)}'`);

    // A member-less union is legal to declare but has no inhabitant.
    if (members.length === 0) {
      return `${this.convertName(node)} = Any`;
    }

    this._usesUnion = true;
    return `${this.convertName(node)} = Union[${members.join(', ')}]`;
  }

  /**
   * Build the `prepend` import lines, emitting only what the generated
   * `content` actually references.
   */
  getImports(content: string): string[] {
    const imports: string[] = [];

    if (this._usesEnum) {
      imports.push('from enum import Enum');
    }

    const typingParts: string[] = [];
    if (content.includes('Optional[')) {
      typingParts.push('Optional');
    }
    if (this._usesTypedDict) {
      typingParts.push('TypedDict');
    }
    if (this._usesUnion) {
      typingParts.push('Union');
    }
    if (/\bAny\b/.test(content)) {
      typingParts.push('Any');
    }
    if (typingParts.length > 0) {
      imports.push(`from typing import ${typingParts.join(', ')}`);
    }

    if (this._usesBaseModel) {
      // `ConfigDict` / `Field` are pydantic names; emit them from the same module
      // as the base model, and only when the generated content uses them.
      const parts = [this.config.baseModel];
      if (content.includes('ConfigDict(')) {
        parts.push('ConfigDict');
      }
      if (content.includes('Field(')) {
        parts.push('Field');
      }
      imports.push(`from ${this.config.runtimeImport} import ${parts.join(', ')}`);
    }

    return imports;
  }
}
