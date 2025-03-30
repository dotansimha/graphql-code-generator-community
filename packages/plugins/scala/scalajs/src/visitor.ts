import autoBind from 'auto-bind';
import {
  GraphQLSchema,
  InputObjectTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  TypeNode,
  UnionTypeDefinitionNode,
} from 'graphql';
import { ScalaBaseVisitor, ScalaResolverParsedConfig } from '@graphql-codegen/scala-common';
import { indent } from '@graphql-codegen/visitor-plugin-common';
import { ScalaJsPluginRawConfig } from './config';

export interface ScalaJsResolverParsedConfig extends ScalaResolverParsedConfig {
}

export class ScalaJsVisitor extends ScalaBaseVisitor<
  ScalaJsPluginRawConfig,
  ScalaJsResolverParsedConfig
> {
  constructor(
    schema: GraphQLSchema,
    config: ScalaJsPluginRawConfig,
    rawConfig?: { outputFile?: string },
  ) {
    super(schema, config, rawConfig);
    autoBind(this);
  }

  public getTypeClassDefinitions(): string {
    return `trait JSConverter[T]:
  def toJS(obj: T): js.Dynamic
  def fromJS(obj: js.Dynamic): T

given [T](using converter: JSConverter[T]): extension (x: T)
  def toJS: js.Dynamic = converter.toJS(x)
`;
  }

  public getImports(): string {
    const imports = [
      'import scala.scalajs.js',
      'import scala.scalajs.js.annotation.*',
      'import scala.scalajs.js.|',
    ];

    if (
      typeof this.config.scalars['DateTime'] === 'string' &&
      this.config.scalars['DateTime'] === 'java.time.Instant'
    ) {
      imports.push('import java.time.Instant');
    }

    imports.push('import scala.language.deprecated.implicit');

    return imports.join('\n');
  }

  private getJsToScalaConverter(name: string, type: TypeNode, optional = false): string {
    if (type.kind === 'NonNullType') {
      return this.getJsToScalaConverter(name, type.type);
    }

    if (type.kind === 'ListType') {
      const innerConverter = this.getJsToScalaConverter('item', type.type);
      const listConverter = `js.Array(${name}).toList.map(item => ${innerConverter})`;

      if (optional || this.config.useOptions) {
        return `if js.isUndefined(obj.${name}) || obj.${name} == null then None else Some(${listConverter})`;
      }

      return listConverter;
    }

    const typeName = this.getTypeName(type);
    const scalarType = this.config.scalars[typeName];
    const scalarTypeStr = typeof scalarType === 'string' ? scalarType : '';

    if (typeName === 'DateTime' && !this.config.scalars['DateTime']) {
      if (optional || this.config.useOptions) {
        return `if js.isUndefined(obj.${name}) || obj.${name} == null then None else Some(${name}.asInstanceOf[java.time.LocalDateTime])`;
      }
      return `${name}.asInstanceOf[java.time.LocalDateTime]`;
    }

    if (scalarType) {
      if (optional || this.config.useOptions) {
        return `if js.isUndefined(obj.${name}) || obj.${name} == null then None else Some(${name}.asInstanceOf[${scalarTypeStr}])`;
      }

      return `${name}.asInstanceOf[${scalarTypeStr}]`;
    }

    if (this.primitiveNames.includes(typeName)) {
      const primitiveType = this.getPrimitiveType(typeName);
      if (optional || this.config.useOptions) {
        return `if js.isUndefined(obj.${name}) || obj.${name} == null then None else Some(${name}.asInstanceOf[${primitiveType}])`;
      }

      return `${name}.asInstanceOf[${primitiveType}]`;
    }

    if (optional || this.config.useOptions) {
      return `if js.isUndefined(obj.${name}) || obj.${name} == null then None else Some(${typeName}.fromJS(${name}))`;
    }

    return `${typeName}.fromJS(${name})`;
  }

  private getScalaToJsConverter(name: string, type: TypeNode, optional = false): string {
    if (type.kind === 'NonNullType') {
      return this.getScalaToJsConverter(name, type.type);
    }

    if (type.kind === 'ListType') {
      const innerConverter = this.getScalaToJsConverter('item', type.type);
      const listConverter = `${name}.map(item => ${innerConverter}).toJSArray`;

      if (optional || this.config.useOptions) {
        return `${name}.fold(js.undefined)(x => x.map(item => ${innerConverter}).toJSArray)`;
      }

      return listConverter;
    }

    const typeName = this.getTypeName(type);
    const scalarType = this.config.scalars[typeName];

    if (scalarType || this.primitiveNames.includes(typeName)) {
      if (optional || this.config.useOptions) {
        return `${name}.fold(js.undefined)(x => x)`;
      }
      return `${name}`;
    }

    if (optional || this.config.useOptions) {
      return `${name}.fold(js.undefined)(x => ${typeName}.toJS(x))`;
    }

    return `${typeName}.toJS(${name})`;
  }

  public InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    let content = super.InputObjectTypeDefinition(node);
    const inputName = node.name.value;

    if (this.config.generateCompanionObjects) {
      const parts: string[] = [];
      parts.push(`object ${inputName}:`);
      parts.push(indent('@JSExportTopLevel("' + inputName + '")'));
      parts.push(indent(`def fromJS(obj: js.Dynamic): ${inputName} =`));
      parts.push(indent(indent(`${inputName}(`)));

      const fieldparts: string[] = (node.fields || []).map(field => {
        const fieldName = this.formatFieldName(field.name.value);
        const isNullable = field.type.kind !== 'NonNullType';
        const converter = this.getJsToScalaConverter(
          fieldName,
          field.type,
          isNullable && this.config.useOptions,
        );
        return `${fieldName} = ${converter}`;
      });

      if (fieldparts.length > 0) {
        parts.push(fieldparts.map(part => indent(indent(indent(part)))).join(',\n'));
      }

      parts.push(indent(indent(')')));
      parts.push(indent('@JSExportTopLevel("' + inputName + 'JS")'));
      parts.push(indent(`def toJS(obj: ${inputName}): js.Dynamic =`));
      parts.push(indent(indent('val result = js.Dynamic.literal()')));

      const fieldToJSParts: string[] = (node.fields || []).map(field => {
        const fieldName = this.formatFieldName(field.name.value);
        const jsFieldName = field.name.value;
        const isNullable = field.type.kind !== 'NonNullType';
        const converter = this.getScalaToJsConverter(
          fieldName,
          field.type,
          isNullable && this.config.useOptions,
        );
        return `result.updateDynamic("${jsFieldName}")(${converter})`;
      });

      if (fieldToJSParts.length > 0) {
        parts.push(fieldToJSParts.map(part => indent(indent(part))).join('\n'));
      }

      parts.push(indent(indent('result')));
      parts.push(indent(`given Conversion[${inputName}, js.Dynamic] with`));
      parts.push(indent(indent(`def apply(x: ${inputName}): js.Dynamic = toJS(x)`)));

      content += '\n\n' + parts.join('\n');
    }

    return content;
  }

  public ObjectTypeDefinition(node: ObjectTypeDefinitionNode): string {
    let content = super.ObjectTypeDefinition(node);
    const objectName = node.name.value;

    if (this.config.generateCompanionObjects) {
      const parts: string[] = [];
      parts.push(`object ${objectName}:`);
      parts.push(indent('@JSExportTopLevel("' + objectName + '")'));
      parts.push(indent(`def fromJS(obj: js.Dynamic): ${objectName} =`));
      parts.push(indent(indent(`${objectName}(`)));

      const fieldparts: string[] = (node.fields || []).map(field => {
        const fieldName = this.formatFieldName(field.name.value);
        const isNullable = field.type.kind !== 'NonNullType';
        const converter = this.getJsToScalaConverter(
          fieldName,
          field.type,
          isNullable && this.config.useOptions,
        );
        return `${fieldName} = ${converter}`;
      });

      if (fieldparts.length > 0) {
        parts.push(fieldparts.map(part => indent(indent(indent(part)))).join(',\n'));
      }

      parts.push(indent(indent(')')));
      parts.push(indent('@JSExportTopLevel("' + objectName + 'JS")'));
      parts.push(indent(`def toJS(obj: ${objectName}): js.Dynamic =`));
      parts.push(indent(indent('val result = js.Dynamic.literal()')));

      const fieldToJSParts: string[] = (node.fields || []).map(field => {
        const fieldName = this.formatFieldName(field.name.value);
        const jsFieldName = field.name.value;
        const isNullable = field.type.kind !== 'NonNullType';
        const converter = this.getScalaToJsConverter(
          fieldName,
          field.type,
          isNullable && this.config.useOptions,
        );
        return `result.updateDynamic("${jsFieldName}")(${converter})`;
      });

      if (fieldToJSParts.length > 0) {
        parts.push(fieldToJSParts.map(part => indent(indent(part))).join('\n'));
      }

      parts.push(indent(indent('result')));
      parts.push(indent(`given Conversion[${objectName}, js.Dynamic] with`));
      parts.push(indent(indent(`def apply(x: ${objectName}): js.Dynamic = toJS(x)`)));

      content += '\n\n' + parts.join('\n');
    }

    return content;
  }

  public UnionTypeDefinition(node: UnionTypeDefinitionNode): string {
    let content = super.UnionTypeDefinition(node);
    const name = node.name.value;
    const types = node.types || [];
    const typeNames = types.map(t => t.name.value);

    if (this.config.generateCompanionObjects) {
      const parts: string[] = [];
      parts.push(`object ${name}:`);
      parts.push(indent('@JSExportTopLevel("' + name + '")'));
      parts.push(indent(`def fromJS(obj: js.Dynamic): ${name} =`));

      if (types.length > 0) {
        const firstTypeName = typeNames[0];

        parts.push(
          indent(
            indent(
              `def safeConvert[T](convert: => T): Option[T] = try Some(convert) catch case _: Exception => None`,
            ),
          ),
        );

        typeNames.forEach((typeName, index) => {
          const varName = `attempt${index + 1}`;
          parts.push(indent(indent(`val ${varName} = safeConvert(${typeName}.fromJS(obj))`)));
        });


        let chain = `attempt1`;
        for (let i = 2; i <= typeNames.length; i++) {
          chain += `.orElse(attempt${i})`;
        }

        parts.push(indent(indent(`${chain}.getOrElse {`)));
        parts.push(indent(indent(indent(`println("Warning: Could not convert JS object to any ${name} type")`))));
        parts.push(indent(indent(indent(`${firstTypeName}(`))));

        const firstType = this.schema.getType(firstTypeName);
        if (firstType && 'getFields' in firstType && typeof firstType.getFields === 'function') {
          const fields = firstType.getFields();
          const fieldNames = Object.keys(fields);

          if (fieldNames.length > 0) {
            const defaultFieldParts = fieldNames.map(fieldName => {
              return indent(
                indent(
                  indent(indent(`${this.formatFieldName(fieldName)} = null.asInstanceOf[Any]`)),
                ),
              );
            });
            parts.push(defaultFieldParts.join(',\n'));
          }
        }

        parts.push(indent(indent(indent(`)`))));
        parts.push(indent(indent(`}`)));
      } else {
        parts.push(indent(indent(`println("Warning: Empty union type ${name}")`)));
        parts.push(indent(indent(`null.asInstanceOf[${name}]`)));
      }

      parts.push(indent('@JSExportTopLevel("' + name + 'JS")'));
      parts.push(indent(`def toJS(obj: ${name}): js.Dynamic = obj match`));

      types.forEach(type => {
        const typeName = type.name.value;
        parts.push(indent(indent(`case value: ${typeName} => ${typeName}.toJS(value)`)));
      });

      content += '\n\n' + parts.join('\n');
    }

    return content;
  }

  public InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode): string {
    let content = super.InterfaceTypeDefinition(node);
    const interfaceName = node.name.value;

    if (this.config.generateCompanionObjects) {
      const parts: string[] = [];
      parts.push(`object ${interfaceName}:`);
      parts.push(indent('@JSExportTopLevel("' + interfaceName + 'JS")'));
      parts.push(indent(`def toJS(obj: ${interfaceName}): js.Dynamic =`));
      parts.push(indent(indent('val result = js.Dynamic.literal()')));

      const fields = node.fields || [];
      for (const field of fields) {
        const fieldName = field.name.value;
        const jsFieldName = fieldName;

        parts.push(
          indent(indent(`result.updateDynamic("${jsFieldName}")(obj.${fieldName})`)),
        );
      }

      parts.push(indent(indent('result')));
      parts.push(indent(`given Conversion[${interfaceName}, js.Dynamic] with`));
      parts.push(indent(indent(`def apply(x: ${interfaceName}): js.Dynamic = toJS(x)`)));

      content += '\n\n' + parts.join('\n');
    }

    return content;
  }
}
