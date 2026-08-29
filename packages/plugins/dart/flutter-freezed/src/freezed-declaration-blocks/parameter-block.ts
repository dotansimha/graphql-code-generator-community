// import { indent } from '@graphql-codegen/visitor-plugin-common';
import { ListTypeNode, NamedTypeNode, NonNullTypeNode, TypeNode } from 'graphql';
import { indent } from '@graphql-codegen/visitor-plugin-common';
import { Config } from '../config/config-value.js';
import { FieldName, TypeName } from '../config/pattern.js';
import {
  AppliesOnParameters,
  FieldType,
  FlutterFreezedPluginConfig,
  NodeType,
} from '../config/plugin-config.js';
import { atJsonKeyDecorator, stringIsNotEmpty } from '../utils.js';
import { Block } from './index.js';

function toPascalCase(str: string): string {
  if(!str.includes('-')) return str;

  return str
    .split('-')                     // Split the string by hyphens
    .map((word, index) =>           // Capitalize each word, except the first one
      index === 0
        ? word                      // Keep the first word in lowercase
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()  // Capitalize subsequent words
    )
    .join('');                      // Join the words together without spaces
}

export class ParameterBlock {
  public static build(
    config: FlutterFreezedPluginConfig,
    node: NodeType,
    field: FieldType,
    blockAppliesOn: readonly AppliesOnParameters[],
  ): string {
    const typeName = TypeName.fromString(node.name.value);
    const fieldName = FieldName.fromString(field.name.value);
    const parameterName = Block.buildBlockName(
      config,
      blockAppliesOn,
      fieldName.value,
      typeName,
      fieldName,
      'camelCase',
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
    blockAppliesOn: readonly AppliesOnParameters[],
  ): string => {
    const deprecatedDecorator = Config.deprecated(config, blockAppliesOn, typeName, fieldName);

    const defaultValueDecorator = Config.defaultValues(config, blockAppliesOn, typeName, fieldName);

    const jsonKeyDecorator = atJsonKeyDecorator({
      name: fieldName.value !== parameterName ? fieldName.value : undefined,
    });

    return [
      deprecatedDecorator,
      defaultValueDecorator,
      jsonKeyDecorator,
      // TODO: add decorator for unionValueName
    ]
      .filter(decorator => stringIsNotEmpty(decorator))
      .map(decorator => indent(decorator, 2))
      .join('');
  };

  public static buildBody = (
    config: FlutterFreezedPluginConfig,
    field: FieldType,
    typeName: TypeName,
    fieldName: FieldName,
    parameterName: string,
    blockAppliesOn: readonly AppliesOnParameters[],
  ): string => {
    const required = this.isNonNullType(field.type) ? 'required ' : '';
    const final = Config.final(config, blockAppliesOn, typeName, fieldName) ? 'final ' : '';
    const dartType = this.parameterType(config, field.type);

    return indent(`${required}${final}${dartType} ${parameterName},\n`, 2);
  };

  public static parameterType = (
    config: FlutterFreezedPluginConfig,
    type: TypeNode,
    parentType?: TypeNode,
  ): string => {
    if (this.isNonNullType(type)) {
      return this.parameterType(config, type.type, type);
    }

    if (this.isListType(type)) {
      const T = this.parameterType(config, type.type, type);
      return `List<${toPascalCase(T)}>${this.isNonNullType(parentType) ? '' : '?'}`;
    }

    if (this.isNamedType(type)) {
      return `${toPascalCase(Config.customScalars(config, type.name.value))}${
        this.isNonNullType(parentType) ? '' : '?'
      }`;
    }

    return '';
  };

  public static isListType = (type?: TypeNode): type is ListTypeNode => type?.kind === 'ListType';

  public static isNonNullType = (type?: TypeNode): type is NonNullTypeNode =>
    type?.kind === 'NonNullType';

  public static isNamedType = (type?: TypeNode): type is NamedTypeNode =>
    type?.kind === 'NamedType';
}
