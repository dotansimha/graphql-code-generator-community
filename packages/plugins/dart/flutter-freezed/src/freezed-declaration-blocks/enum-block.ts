import { EnumTypeDefinitionNode, EnumValueDefinitionNode } from 'graphql';
import { TypeName, FieldName } from '../config/pattern.js';
import { APPLIES_ON_ENUM, APPLIES_ON_ENUM_VALUE, FlutterFreezedPluginConfig } from '../config/plugin-config.js';
import { indent } from '@graphql-codegen/visitor-plugin-common';
import { Block } from './index.js';
import { Config } from '../config/config-value.js';
import { atJsonKeyDecorator, stringIsNotEmpty } from '../utils.js';

export class EnumBlock {
  // TODO: @next-version: Implement enhanced enums
  public static build(config: FlutterFreezedPluginConfig, node: EnumTypeDefinitionNode): string {
    const typeName = TypeName.fromString(node.name.value);

    let block = '';

    block += Block.buildComment(node);

    block += this.buildDecorators();

    block += this.buildHeader(config, typeName);

    block += this.buildBody(config, node);

    block += this.buildFooter();

    return block;
  }

  public static buildDecorators = (): string => {
    // TODO: @next-version: @JsonEnum(valueField: 'code', fieldRename: 'new-name')
    return '';
  };

  public static buildHeader = (config: FlutterFreezedPluginConfig, typeName: TypeName): string => {
    const enumTypeName = Block.buildBlockName(
      config,
      APPLIES_ON_ENUM,
      typeName.value,
      typeName,
      undefined,
      'PascalCase'
    );
    return `enum ${enumTypeName} {\n`;
  };

  public static buildBody = (config: FlutterFreezedPluginConfig, node: EnumTypeDefinitionNode): string => {
    const typeName = TypeName.fromString(node.name.value);
    return (node.values ?? [])
      ?.map((enumValue: EnumValueDefinitionNode) => {
        const fieldName = FieldName.fromString(enumValue.name.value);
        const enumValueName = Block.buildBlockName(
          config,
          APPLIES_ON_ENUM_VALUE,
          fieldName.value,
          typeName,
          fieldName,
          Config.camelCasedEnums(config)
        );

        const comment = Block.buildComment(enumValue);
        const jsonKey = atJsonKeyDecorator({
          name: fieldName.value !== enumValueName ? fieldName.value : undefined,
        });
        //TODO: @next-version: const jsonValue = @JsonValue(String|int)
        const decorators = [
          jsonKey,
          // jsonValue
        ].join('');

        return [comment, decorators, `${enumValueName}\n`]
          .map(block => (stringIsNotEmpty(block) ? indent(block) : block))
          .join('');
      })
      .join('');
  };

  public static buildFooter = (): string => {
    return '}\n\n';
  };
}
