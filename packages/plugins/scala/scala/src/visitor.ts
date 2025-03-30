import {
  ScalaBaseVisitor,
  ScalaResolverParsedConfig as BaseScalaResolverParsedConfig
} from '@graphql-codegen/scala-common';
import { ScalaPluginRawConfig } from './config';
import {
  GraphQLSchema,
  InputObjectTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  EnumTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  UnionTypeDefinitionNode
} from 'graphql';

import autoBind from 'auto-bind';
import { indent } from '@graphql-codegen/visitor-plugin-common';

export interface ScalaResolverParsedConfig extends BaseScalaResolverParsedConfig {
  jsonLibrary: 'none' | 'circe' | 'zio-json' | 'play-json';
}

export class ScalaVisitor extends ScalaBaseVisitor<ScalaPluginRawConfig, ScalaResolverParsedConfig> {
  constructor(schema: GraphQLSchema, config: ScalaPluginRawConfig, rawConfig?: { outputFile?: string }) {
    super(schema, config, rawConfig, {
      jsonLibrary: config.jsonLibrary || 'none'
    });

    autoBind(this);
  }

  public getImports(): string {
    const imports = [
      'import scala.util.Try',
    ];

    if (typeof this.config.scalars['DateTime'] === 'string' &&
        this.config.scalars['DateTime'] === 'java.time.Instant') {
      imports.push('import java.time.Instant');
    }

    switch (this.config.jsonLibrary) {
      case 'circe':
        imports.push('import io.circe.*');
        imports.push('import io.circe.generic.semiauto.*');
        imports.push('import io.circe.syntax.*');
        break;
      case 'zio-json':
        imports.push('import zio.json.*');
        break;
      case 'play-json':
        imports.push('import play.api.libs.json.*');
        imports.push('import play.api.libs.functional.syntax.*');
        break;
    }

    return imports.join('\n');
  }

  private generateJsonCodecs(typeName: string): string {
    if (this.config.jsonLibrary === 'none') {
      return '';
    }

    switch (this.config.jsonLibrary) {
      case 'circe':
        return this.generateCirceCodecs(typeName);
      case 'zio-json':
        return this.generateZioJsonCodecs(typeName);
      case 'play-json':
        return this.generatePlayJsonCodecs(typeName);
      default:
        return '';
    }
  }

  private generateCirceCodecs(typeName: string): string {
    return [
      indent(`given ${typeName.charAt(0).toLowerCase() + typeName.slice(1)}Encoder: Encoder[${typeName}] = deriveEncoder`),
      indent(`given ${typeName.charAt(0).toLowerCase() + typeName.slice(1)}Decoder: Decoder[${typeName}] = deriveDecoder`)
    ].join('\n');
  }

  private generateZioJsonCodecs(typeName: string): string {
    return [
      indent(`given ${typeName.charAt(0).toLowerCase() + typeName.slice(1)}Encoder: JsonEncoder[${typeName}] = DeriveJsonEncoder.gen`),
      indent(`given ${typeName.charAt(0).toLowerCase() + typeName.slice(1)}Decoder: JsonDecoder[${typeName}] = DeriveJsonDecoder.gen`)
    ].join('\n');
  }

  private generatePlayJsonCodecs(typeName: string): string {
    return `${indent(`given ${typeName.charAt(0).toLowerCase() + typeName.slice(1)}Format: OFormat[${typeName}] = Json.format[${typeName}]`)}`;
  }

  private generateEnumJsonCodecs(enumName: string, enumValues: string[]): string {
    if (this.config.jsonLibrary === 'none') {
      return '';
    }

    switch (this.config.jsonLibrary) {
      case 'circe':
        return this.generateCirceEnumCodecs(enumName, enumValues);
      case 'zio-json':
        return this.generateZioJsonEnumCodecs(enumName, enumValues);
      case 'play-json':
        return this.generatePlayJsonEnumCodecs(enumName, enumValues);
      default:
        return '';
    }
  }

  private generateCirceEnumCodecs(enumName: string, enumValues: string[]): string {
    return [
      indent(`given ${enumName.charAt(0).toLowerCase() + enumName.slice(1)}Encoder: Encoder[${enumName}] = Encoder.encodeString.contramap {`),
      indent(indent(`case ${enumValues.map(v => `${enumName}.${v} => "${v}"`).join('\n' + indent(indent('case ')))}`)),
      indent(`}`),
      '',
      indent(`given ${enumName.charAt(0).toLowerCase() + enumName.slice(1)}Decoder: Decoder[${enumName}] = Decoder.decodeString.emap {`),
      indent(indent(`case ${enumValues.map(v => `"${v}" => Right(${enumName}.${v})`).join('\n' + indent(indent('case ')))}`)),
      indent(indent(`case other => Left(s"Invalid ${enumName}: $other")`)),
      indent(`}`)
    ].join('\n');
  }

  private generateZioJsonEnumCodecs(enumName: string, enumValues: string[]): string {
    return [
      indent(`given ${enumName.charAt(0).toLowerCase() + enumName.slice(1)}Encoder: JsonEncoder[${enumName}] = JsonEncoder.string.contramap {`),
      indent(indent(`case ${enumValues.map(v => `${enumName}.${v} => "${v}"`).join('\n' + indent(indent('case ')))}`)),
      indent(`}`),
      '',
      indent(`given ${enumName.charAt(0).toLowerCase() + enumName.slice(1)}Decoder: JsonDecoder[${enumName}] = JsonDecoder.string.mapOrFail {`),
      indent(indent(`case ${enumValues.map(v => `"${v}" => Right(${enumName}.${v})`).join('\n' + indent(indent('case ')))}`)),
      indent(indent(`case other => Left(s"Invalid ${enumName}: $other")`)),
      indent(`}`)
    ].join('\n');
  }

  private generatePlayJsonEnumCodecs(enumName: string, enumValues: string[]): string {
    return [
      indent(`given ${enumName.charAt(0).toLowerCase() + enumName.slice(1)}Format: Format[${enumName}] = Format(`),
      indent(indent(`Writes {`)),
      indent(indent(indent(`case ${enumValues.map(v => `${enumName}.${v} => JsString("${v}")`).join('\n' + indent(indent(indent('case '))))}`))),
      indent(indent(`},`)),
      indent(indent(`Reads {`)),
      indent(indent(indent(`case JsString(${enumValues.map(v => `"${v}"`).join(' | ')}) => JsSuccess(${enumName}.valueOf(value).get)`))),
      indent(indent(indent(`case _ => JsError("Invalid ${enumName}")`))),
      indent(indent(`}`)),
      indent(`)`)
    ].join('\n');
  }

  public InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    let content = super.InputObjectTypeDefinition(node);

    if (this.config.jsonLibrary !== 'none' && this.config.generateCompanionObjects) {
      const typeName = node.name.value;
      const jsonCodecs = this.generateJsonCodecs(typeName);

      if (jsonCodecs) {
        if (content.includes(`object ${typeName}:`)) {
          content = content.replace(`object ${typeName}:`, `object ${typeName}:\n${jsonCodecs}`);
        } else {
          content += `\n\nobject ${typeName}:\n${jsonCodecs}`;
        }
      }
    }

    return content;
  }

  public ObjectTypeDefinition(node: ObjectTypeDefinitionNode): string {
    let content = super.ObjectTypeDefinition(node);

    if (this.config.jsonLibrary !== 'none' && this.config.generateCompanionObjects) {
      const typeName = node.name.value;
      const jsonCodecs = this.generateJsonCodecs(typeName);

      if (jsonCodecs) {
        if (content.includes(`object ${typeName}:`)) {
          content = content.replace(`object ${typeName}:`, `object ${typeName}:\n${jsonCodecs}`);
        } else {
          content += `\n\nobject ${typeName}:\n${jsonCodecs}`;
        }
      }
    }

    return content;
  }

  public EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    let content = super.EnumTypeDefinition(node);
    const enumName = node.name.value;

    if (this.config.scalars && typeof this.config.scalars[enumName] === 'string') {
      return content;
    }

    if (this.config.jsonLibrary !== 'none' && this.config.generateCompanionObjects) {
      const enumValues = (node.values || []).map(v => v.name.value);

      if (enumValues.length > 0) {
        const jsonCodecs = this.generateEnumJsonCodecs(enumName, enumValues);

        if (jsonCodecs) {
          if (content.includes(`object ${enumName}:`)) {
            content = content.replace(`object ${enumName}:`, `object ${enumName}:\n${jsonCodecs}`);
          } else {
            content += `\n\nobject ${enumName}:\n${jsonCodecs}`;
          }
        }
      }
    }

    return content;
  }

  public InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode): string {
    let content = super.InterfaceTypeDefinition(node);

    if (this.config.jsonLibrary !== 'none' && this.config.generateCompanionObjects) {
      const interfaceName = node.name.value;

      let jsonCodecs = '';

      switch (this.config.jsonLibrary) {
        case 'circe':
          jsonCodecs = [
            indent(`trait ${interfaceName}Encoder {`),
            indent(indent(`given encoder: Encoder[${interfaceName}]`)),
            indent(`}`),
            indent(`trait ${interfaceName}Decoder {`),
            indent(indent(`given decoder: Decoder[${interfaceName}]`)),
            indent(`}`)
          ].join('\n');
          break;
        case 'zio-json':
          jsonCodecs = [
            indent(`trait ${interfaceName}JsonEncoder {`),
            indent(indent(`given encoder: JsonEncoder[${interfaceName}]`)),
            indent(`}`),
            indent(`trait ${interfaceName}JsonDecoder {`),
            indent(indent(`given decoder: JsonDecoder[${interfaceName}]`)),
            indent(`}`)
          ].join('\n');
          break;
        case 'play-json':
          jsonCodecs = [
            indent(`trait ${interfaceName}Format {`),
            indent(indent(`given format: Format[${interfaceName}]`)),
            indent(`}`)
          ].join('\n');
          break;
      }

      if (jsonCodecs) {
        if (content.includes(`object ${interfaceName}:`)) {
          content = content.replace(`object ${interfaceName}:`, `object ${interfaceName}:\n${jsonCodecs}`);
        } else {
          content += `\n\nobject ${interfaceName}:\n${jsonCodecs}`;
        }
      }
    }

    return content;
  }

  public UnionTypeDefinition(node: UnionTypeDefinitionNode): string {
    let content = super.UnionTypeDefinition(node);

    if (this.config.jsonLibrary !== 'none' && this.config.generateCompanionObjects) {
      const unionName = node.name.value;
      const unionTypes = (node.types || []).map(t => t.name.value);

      if (unionTypes.length > 0) {
        let jsonCodecs = '';

        switch (this.config.jsonLibrary) {
          case 'circe':
            jsonCodecs = [
              indent(`given ${unionName.charAt(0).toLowerCase() + unionName.slice(1)}Encoder: Encoder[${unionName}] = Encoder.instance {`),
              indent(indent(`case ${unionTypes.map(t => `value: ${t} => value.asJson`).join('\n' + indent(indent('case ')))}`)),
              indent(`}`),
              indent(`given ${unionName.charAt(0).toLowerCase() + unionName.slice(1)}Decoder: Decoder[${unionName}] = {`),
              indent(indent(`List[Decoder[${unionName}]](`)),
              indent(indent(indent(`${unionTypes.map(t => `Decoder[${t}].map(x => x: ${unionName})`).join(',\n' + indent(indent(indent(''))))}`))),
              indent(indent(`)`)),
              indent(indent(`.reduceLeft(_ or _)`)),
              indent(`}`),
            ].join('\n');
            break;
          case 'zio-json':
            jsonCodecs = [
              indent(`given ${unionName.charAt(0).toLowerCase() + unionName.slice(1)}Encoder: JsonEncoder[${unionName}] = JsonEncoder.instance {`),
              indent(indent(`case ${unionTypes.map(t => `value: ${t} => JsonEncoder[${t}].toJson(value)`).join('\n' + indent(indent('case ')))}`)),
              indent(`}`),
              indent(`given ${unionName.charAt(0).toLowerCase() + unionName.slice(1)}Decoder: JsonDecoder[${unionName}] = {`),
              indent(indent(`List[JsonDecoder[${unionName}]](`)),
              indent(indent(indent(`${unionTypes.map(t => `JsonDecoder[${t}].map(x => x: ${unionName})`).join(',\n' + indent(indent(indent(''))))}`))),
              indent(indent(`)`)),
              indent(indent(`.reduceLeft(_ orElse _)`)),
              indent(`}`)
            ].join('\n');
            break;
          case 'play-json':
            jsonCodecs = [
              indent(`given ${unionName.charAt(0).toLowerCase() + unionName.slice(1)}Format: Format[${unionName}] = Format(`),
              indent(indent(`Writes {`)),
              indent(indent(indent(`case ${unionTypes.map(t => `value: ${t} => Json.toJson(value)(summon[Writes[${t}]])`).join('\n' + indent(indent(indent('case '))))}`))),
              indent(indent(`},`)),
              indent(indent(`Reads {`)),
              indent(indent(indent(`${unionTypes.map(t => `summon[Reads[${t}]].map(x => x: ${unionName})`).join(' orElse\n' + indent(indent(indent(''))))}`))),
              indent(indent(`}`)),
              indent(`)`)
            ].join('\n');
            break;
        }

        if (jsonCodecs) {
          if (content.includes(`object ${unionName}:`)) {
            content = content.replace(`object ${unionName}:`, `object ${unionName}:\n${jsonCodecs}`);
          } else {
            content += `\n\nobject ${unionName}:\n${jsonCodecs}`;
          }
        }
      }
    }

    return content;
  }
}
