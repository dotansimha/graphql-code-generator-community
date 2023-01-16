import { indent } from '@graphql-codegen/visitor-plugin-common';
import { Config } from '../config/config-value';
import { TypeName } from '../config/pattern';
import {
  FlutterFreezedPluginConfig,
  ObjectType,
  AppliesOnFactory,
  AppliesOnParameters,
  AppliesOnDefaultFactory,
  AppliesOnNamedFactory,
  APPLIES_ON_DEFAULT_FACTORY,
  APPLIES_ON_UNION_FACTORY,
  APPLIES_ON_MERGED_FACTORY,
  APPLIES_ON_DEFAULT_FACTORY_PARAMETERS,
  APPLIES_ON_UNION_FACTORY_PARAMETERS,
  APPLIES_ON_MERGED_FACTORY_PARAMETERS,
} from '../config/plugin-config';
import { NodeRepository } from './node-repository';
import { Block } from './index';
import { ParameterBlock } from './parameter-block';
import { FieldDefinitionNode, InputValueDefinitionNode } from 'graphql';
import { stringIsNotEmpty } from '../utils';

export class FactoryBlock {
  public static build(
    config: FlutterFreezedPluginConfig,
    node: ObjectType,
    blockAppliesOn: readonly AppliesOnFactory[],
    className: TypeName,
    factoryName?: TypeName
  ): string {
    let block = '';

    block += Block.buildComment(node);

    block += this.buildDecorators(config, blockAppliesOn, className, factoryName);

    block += this.buildHeader(config, blockAppliesOn, className, factoryName);

    block += this.buildBody(config, node, blockAppliesOn);

    factoryName = blockAppliesOn.includes('default_factory') ? className : factoryName;
    block += this.buildFooter(config, blockAppliesOn, factoryName);

    return block;
  }

  public static buildDecorators = (
    config: FlutterFreezedPluginConfig,
    blockAppliesOn: readonly AppliesOnFactory[],
    className: TypeName,
    factoryName?: TypeName
  ): string => {
    // TODO: @Assert
    const typeName = factoryName ? TypeName.fromUnionOfTypeNames(className, factoryName) : className;

    const deprecatedDecorator = Config.deprecated(config, blockAppliesOn, typeName);

    const decorators = [deprecatedDecorator].join('');

    return stringIsNotEmpty(decorators) ? indent(decorators) : decorators;
  };

  public static buildHeader = (
    config: FlutterFreezedPluginConfig,
    blockAppliesOn: readonly AppliesOnFactory[],
    className: TypeName,
    factoryName?: TypeName
  ) => {
    const typeName = factoryName ? TypeName.fromUnionOfTypeNames(className, factoryName) : className;

    const immutable = Config.immutable(config, typeName);
    // const mutableInputs = Config.mutableInputs(config, factoryName);
    // const mutable = immutable !== true || (node.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION && mutableInputs);
    const constFactory = immutable ? indent('const factory') : indent('factory');
    const _className = Block.buildBlockName(
      config,
      blockAppliesOn,
      className.value,
      className,
      undefined,
      'PascalCase'
    );

    if (factoryName) {
      const _factoryName = Block.buildBlockName(
        config,
        blockAppliesOn,
        factoryName.value,
        factoryName,
        undefined,
        'camelCase'
      );
      return `${constFactory} ${_className}.${_factoryName}({\n`;
    }

    return `${constFactory} ${_className}({\n`;
  };

  public static buildBody = (
    config: FlutterFreezedPluginConfig,
    node: ObjectType,
    appliesOn: readonly AppliesOnFactory[]
  ): string => {
    let appliesOnParameters: readonly AppliesOnParameters[] = [];
    if (appliesOn.includes('default_factory')) {
      appliesOnParameters = APPLIES_ON_DEFAULT_FACTORY_PARAMETERS;
    } else if (appliesOn.includes('union_factory')) {
      appliesOnParameters = APPLIES_ON_UNION_FACTORY_PARAMETERS;
    } else if (appliesOn.includes('merged_factory')) {
      appliesOnParameters = APPLIES_ON_MERGED_FACTORY_PARAMETERS;
    }

    return (
      node.fields
        ?.map((field: FieldDefinitionNode | InputValueDefinitionNode) => {
          return ParameterBlock.build(config, node, field, appliesOnParameters);
        })
        .join('') ?? ''
    );
  };

  public static buildFooter = (
    config: FlutterFreezedPluginConfig,
    blockAppliesOn: readonly AppliesOnFactory[],
    factoryName: TypeName
  ) => {
    const _ = blockAppliesOn.includes('default_factory') ? '_' : '';
    const _factoryName = Block.buildBlockName(
      config,
      blockAppliesOn,
      factoryName.value,
      factoryName,
      undefined,
      'PascalCase'
    );
    return indent(`}) = ${_}${_factoryName};\n\n`);
  };

  public static serializeDefaultFactory = (className: TypeName): string => {
    return `${Block.tokens.defaultFactory}${className.value}==>${APPLIES_ON_DEFAULT_FACTORY.join(',')}\n`;
  };

  public static serializeUnionFactory = (className: TypeName, factoryName: TypeName): string => {
    return `${Block.tokens.unionFactory}${className.value}==>${factoryName.value}==>${APPLIES_ON_UNION_FACTORY.join(
      ','
    )}\n`;
  };

  public static serializeMergedFactory = (className: TypeName, factoryName: TypeName): string => {
    return `${Block.tokens.mergedFactory}${className.value}==>${factoryName.value}==>${APPLIES_ON_MERGED_FACTORY.join(
      ','
    )}\n`;
  };

  public static deserializeFactory = (
    config: FlutterFreezedPluginConfig,
    nodeRepository: NodeRepository,
    blockAppliesOn: readonly AppliesOnDefaultFactory[],
    className: TypeName
  ): string => {
    const node = nodeRepository.get(className.value);

    if (node) {
      return FactoryBlock.buildFromFactory(config, node, blockAppliesOn, className);
    }

    return '';
  };

  public static deserializeNamedFactory = (
    config: FlutterFreezedPluginConfig,
    nodeRepository: NodeRepository,
    blockAppliesOn: readonly AppliesOnNamedFactory[],
    className: TypeName,
    factoryName: TypeName
  ): string => {
    const node = nodeRepository.get(factoryName.value);

    if (node) {
      return FactoryBlock.buildFromNamedFactory(config, node, blockAppliesOn, className, factoryName);
    }

    return '';
  };

  public static buildFromFactory = (
    config: FlutterFreezedPluginConfig,
    node: ObjectType,
    blockAppliesOn: readonly AppliesOnDefaultFactory[],
    className: TypeName
  ): string => {
    return FactoryBlock.build(config, node, blockAppliesOn, className);
  };

  public static buildFromNamedFactory = (
    config: FlutterFreezedPluginConfig,
    node: ObjectType,
    blockAppliesOn: readonly AppliesOnNamedFactory[],
    className: TypeName,
    factoryName: TypeName
  ): string => {
    return FactoryBlock.build(config, node, blockAppliesOn, className, factoryName);
  };
}
