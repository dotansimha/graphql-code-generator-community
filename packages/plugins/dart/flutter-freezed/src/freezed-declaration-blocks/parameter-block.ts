// import { indent } from '@graphql-codegen/visitor-plugin-common';
import { ListTypeNode, NamedTypeNode, NonNullTypeNode, TypeNode } from 'graphql';
import { atJsonKeyDecorator, stringIsNotEmpty } from '../utils';
import { Config } from '../config/config-value';
import { FieldName, TypeName } from '../config/pattern';
import { AppliesOnParameters, FieldType, FlutterFreezedPluginConfig, NodeType } from '../config/plugin-config';
import { Block } from './index';
import { indent } from '@graphql-codegen/visitor-plugin-common';

export class ParameterBlock {
  public static build(
    config: FlutterFreezedPluginConfig,
    node: NodeType,
    field: FieldType,
    blockAppliesOn: readonly AppliesOnParameters[]
  ): string {
    const typeName = TypeName.fromString(node.name.value);
    const fieldName = FieldName.fromString(field.name.value);
    const parameterName = Block.buildBlockName(
      config,
      blockAppliesOn,
      fieldName.value,
      typeName,
      fieldName,
      'camelCase'
    );

    let block = '';

    block += Block.buildComment(field);

    block += this.buildDecorators(config, typeName, fieldName, parameterName, blockAppliesOn);

    block += this.buildBody(config, field, typeName, fieldName, parameterName, blockAppliesOn);

    // return indentMultiline(block, 2);
    return block;
  }

  public static buildDecorators = (
    config: FlutterFreezedPluginConfig,
    typeName: TypeName,
    fieldName: FieldName,
    parameterName: string,
    blockAppliesOn: readonly AppliesOnParameters[]
  ): string => {
    const deprecatedDecorator = Config.deprecated(config, blockAppliesOn, typeName, fieldName);

    const defaultValueDecorator = Config.defaultValues(config, blockAppliesOn, typeName, fieldName);

    const jsonKeyDecorator = atJsonKeyDecorator({
      name: fieldName.value !== parameterName ? fieldName.value : undefined,
    });

    const decorators = [
      deprecatedDecorator,
      defaultValueDecorator,
      jsonKeyDecorator,
      // TODO: add decorator for unionValueName
    ].join('');

    return stringIsNotEmpty(decorators) ? indent(decorators, 2) : decorators;
  };

  public static buildBody = (
    config: FlutterFreezedPluginConfig,
    field: FieldType,
    typeName: TypeName,
    fieldName: FieldName,
    parameterName: string,
    blockAppliesOn: readonly AppliesOnParameters[]
  ): string => {
    const required = this.isNonNullType(field.type) ? 'required ' : '';
    const final = Config.final(config, blockAppliesOn, typeName, fieldName) ? 'final ' : '';
    const dartType = this.parameterType(config, field.type);

    return indent(`${required}${final}${dartType} ${parameterName},\n`, 2);
  };

  public static parameterType = (config: FlutterFreezedPluginConfig, type: TypeNode, parentType?: TypeNode): string => {
    if (this.isNonNullType(type)) {
      return this.parameterType(config, type.type, type);
    }

    if (this.isListType(type)) {
      const T = this.parameterType(config, type.type, type);
      return `List<${T}>${this.isNonNullType(parentType) ? '' : '?'}`;
    }

    if (this.isNamedType(type)) {
      return `${Config.customScalars(config, type.name.value)}${this.isNonNullType(parentType) ? '' : '?'}`;
    }

    return '';
  };

  public static isListType = (type?: TypeNode): type is ListTypeNode => type?.kind === 'ListType';

  public static isNonNullType = (type?: TypeNode): type is NonNullTypeNode => type?.kind === 'NonNullType';

  public static isNamedType = (type?: TypeNode): type is NamedTypeNode => type?.kind === 'NamedType';
}
