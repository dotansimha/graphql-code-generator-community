import { Kind } from 'graphql';
import { indent } from '@graphql-codegen/visitor-plugin-common';
import { Config } from '../config/config-value.js';
import { TypeName } from '../config/pattern.js';
import { APPLIES_ON_CLASS, FlutterFreezedPluginConfig, NodeType } from '../config/plugin-config.js';
import { nodeIsObjectType, stringIsNotEmpty } from '../utils.js';
import { FactoryBlock } from './factory-block.js';
import { Block } from './index.js';

export class ClassBlock {
  public static build(config: FlutterFreezedPluginConfig, node: NodeType): string {
    const typeName = TypeName.fromString(node.name.value);
    const _className = Block.buildBlockName(
      config,
      APPLIES_ON_CLASS,
      typeName.value,
      typeName,
      undefined,
      'PascalCase',
    );

    let block = '';

    // the comments should be  on the factory block instead
    // block += Block.buildComment(node);

    block += this.buildDecorators(config, node);

    block += this.buildHeader(config, typeName, _className);

    block += this.buildBody(config, node);

    block += this.buildFooter(_className);

    return block;
  }

  public static buildDecorators = (config: FlutterFreezedPluginConfig, node: NodeType): string => {
    const freezedDecorator = ClassBlock.buildFreezedDecorator(config, node);
    // TODO: consider implementing custom decorators
    return [freezedDecorator].join('');
  };

  static buildFreezedDecorator = (config: FlutterFreezedPluginConfig, node: NodeType): string => {
    // this is the start of the pipeline of decisions to determine which Freezed decorator to use
    return ClassBlock.decorateAsFreezed(config, node);
  };

  static decorateAsFreezed = (config: FlutterFreezedPluginConfig, node: NodeType): string => {
    const typeName = TypeName.fromString(node.name.value);

    const copyWith = Config.copyWith(config, typeName);
    const equal = Config.equal(config, typeName);
    const makeCollectionsUnmodifiable = Config.makeCollectionsUnmodifiable(config, typeName);
    const unionKey = Config.unionKey();
    const unionValueCase = Config.unionValueCase();

    const body = [
      copyWith !== undefined ? `copyWith: ${copyWith},\n` : undefined,
      equal !== undefined ? `equal: ${equal},\n` : undefined,
      makeCollectionsUnmodifiable !== undefined
        ? `makeCollectionsUnmodifiable: ${makeCollectionsUnmodifiable},\n`
        : undefined,
      unionKey !== undefined ? `unionKey: ${unionKey},\n` : undefined,
      unionValueCase !== undefined ? `unionValueCase: '${unionValueCase}',\n` : undefined,
    ]
      .filter(value => value !== undefined)
      .map(value => indent(value))
      .join('');

    return stringIsNotEmpty(body)
      ? `@Freezed(\n${body})\n`
      : ClassBlock.decorateAsUnfreezed(config, node);
  };

  static decorateAsUnfreezed = (config: FlutterFreezedPluginConfig, node: NodeType) => {
    const typeName = TypeName.fromString(node.name.value);
    const immutable = Config.immutable(config, typeName);
    const mutableInputs = Config.mutableInputs(config, typeName);
    const mutable =
      immutable !== true || (node.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION && mutableInputs);

    return mutable ? '@unfreezed\n' : '@freezed\n';
  };

  public static buildHeader = (
    config: FlutterFreezedPluginConfig,
    typeName: TypeName,
    _className: string,
  ): string => {
    const privateEmptyConstructor = Config.privateEmptyConstructor(config, typeName)
      ? indent(`const ${_className}._();\n\n`)
      : '';

    return `class ${_className} with _$${_className} {\n${privateEmptyConstructor}`;
  };

  public static buildBody = (config: FlutterFreezedPluginConfig, node: NodeType): string => {
    const className = TypeName.fromString(node.name.value);

    let body = '';

    if (nodeIsObjectType(node)) {
      body += FactoryBlock.serializeDefaultFactory(className);
    } else if (node.kind === Kind.UNION_TYPE_DEFINITION) {
      body += (node.types ?? [])
        .map(value => {
          const factoryName = TypeName.fromString(value.name.value);
          return FactoryBlock.serializeUnionFactory(className, factoryName);
        })
        .join('');
    }

    body += Config.mergeTypes(config, className)
      .map(factoryName => {
        return FactoryBlock.serializeMergedFactory(className, factoryName);
      })
      .join('');

    return body;
  };

  public static buildFooter = (_className: string): string => {
    return indent(
      `factory ${_className}.fromJson(Map<String, dynamic> json) => _$${_className}FromJson(json);\n}\n\n`,
    );
  };
}
