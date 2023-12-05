import {introspectionFromSchema, Kind, TokenKind} from 'graphql/index';
import {OperationDefinitionNode, OperationTypeNode, SelectionNode, Token,} from 'graphql/language/ast';
import {GraphQLSchema} from 'graphql/type';
import {uniq} from 'lodash';
import {
  ArrayTypeNode,
  Node,
  Project,
  SourceFile,
  Statement,
  SyntaxKind,
  TypeReferenceNode,
  UnionTypeNode,
} from 'ts-morph';
import {ModifierFlags} from 'typescript';
import {Types} from '@graphql-codegen/plugin-helpers';
import {
  ClientSideBasePluginConfig,
  ClientSideBaseVisitor,
  getConfigValue,
  LoadedFragment,
} from '@graphql-codegen/visitor-plugin-common';
import {TypeGuardRawPluginConfig} from './config';

export interface TypeGuardPluginConfig extends ClientSideBasePluginConfig {
  forEntities: string[];
  withHelperFunctions: boolean;
  withTypeGuards: boolean;
  withExportedBaseTypes: boolean;
  withQueryNameDiscriminator: boolean;
  configuredInterfaces: string[];
  typeDepth: number;
}

type TypeSelection = {
  parentNames: string;
  optionalType?: {
    typeName: string;
    typeNode: string;
  };
};

// TODO: #1 write logic that selects the union or interface that is of highest ancestory
// TODO: #2 check if the NonNullable logic covers all cases (probably not)
// TODO: #3 support fragments too!
export class GracefulInterfacesVisitor extends ClientSideBaseVisitor<
  TypeGuardRawPluginConfig,
  TypeGuardPluginConfig
> {
  protected configuredInterfaces: { [key: string]: string }[] = [];
  protected sourceFile: SourceFile;
  private modifications: { position: number; text: string }[] = [];
  private _outputFilePath: string;

  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    protected rawConfig: TypeGuardRawPluginConfig,
    documents: Types.DocumentFile[],
    outputFilePath: string,
  ) {
    super(schema, fragments, rawConfig, {
      forEntities: getConfigValue(rawConfig.forEntities, []),
      withHelperFunctions: getConfigValue(rawConfig.withHelperFunctions, true),
      withQueryNameDiscriminator: getConfigValue(rawConfig.withQueryNameDiscriminator, true),
      withTypeGuards: getConfigValue(rawConfig.withTypeGuards, true),
      withExportedBaseTypes: getConfigValue(rawConfig.withExportedBaseTypes, false),
      typeDepth: getConfigValue(rawConfig.typeDepth, 2),
    });
    this._documents = documents;
    this.configuredInterfaces = this.getQueriedTypeNames();
    this._outputFilePath = outputFilePath;
  }

  private targetExists(nestedField: object, targetValue: string): boolean {
    for (const key in nestedField) {
      if (typeof nestedField[key] === 'object') {
        if (this.targetExists(nestedField[key], targetValue)) return true;
      }
      if (nestedField[key] === targetValue) return true;
    }
    return false;
  }

  private addQueryNameProperty = (node: Node, typeName: string, configuredInterface: string) => {
    const lowercaseInterface =
      configuredInterface.charAt(0).toLowerCase() + configuredInterface.slice(1);
    const properties = node.getDescendantsOfKind(SyntaxKind.PropertySignature);
    const queryNameProperty = properties.find(prop => prop.getNameNode().getText() === '__queryName');
    if (queryNameProperty) {
        return;
    }
    const typenameProperty = properties.find(prop => prop.getNameNode().getText() === '__typename');
    if (typenameProperty) {
      // Collect position and text for insertion
      this.modifications.push({
        position: typenameProperty.getEnd(),
        text: `__queryName: '${typeName}',`,
      });
    }

    const interfaceProperty = properties.find(
      prop => prop.getNameNode().getText() === lowercaseInterface,
    );
    if (interfaceProperty) {
      let actualArrayType;
      const typeNode = interfaceProperty.getTypeNodeOrThrow();

      if (typeNode.getKind() === SyntaxKind.TypeReference) {
        const typeRef = typeNode as TypeReferenceNode;
        if (
          typeRef.getTypeName().getText() === 'Array' &&
          typeRef.getTypeArguments().length === 1
        ) {
          actualArrayType = typeRef.getTypeArguments()[0];
        }
      } else if (typeNode.getKind() === SyntaxKind.ArrayType) {
        actualArrayType = (typeNode as ArrayTypeNode).getElementTypeNode();
      }

      if (actualArrayType) {
        if (actualArrayType.getKind() === SyntaxKind.UnionType) {
          const unionTypes = (actualArrayType as UnionTypeNode).getTypeNodes();
          unionTypes.forEach(type => {});
          for (const type of unionTypes) {
            if (type.getKind() === SyntaxKind.TypeLiteral) {
              this.addQueryNameProperty(type, typeName, configuredInterface);
            }
          }
        }
      }
    }
  };

  private applyModifications() {
    // Apply the modifications from last to first to avoid messing up the positions
    for (let i = this.modifications.length - 1; i >= 0; i--) {
      const mod = this.modifications[i];
      this.sourceFile.insertText(mod.position, mod.text);
    }
    this.sourceFile.saveSync();
    this.modifications = [];
  }

  private getTypeAlias(typeName: string): Statement {
    const typeAlias = this.sourceFile.getStatementOrThrow(statement => {
      if (statement.getKind() === SyntaxKind.TypeAliasDeclaration) {
        return (statement as any).getName() === typeName;
      }
      return false;
    });

    if (!typeAlias) throw Error(`Could not find type alias ${typeName}`);
    return typeAlias;
  }

  private getTypeNode(typeName: string, typeAlias?: Statement): Node {
    if (!typeAlias) {
      typeAlias = this.getTypeAlias(typeName);
    }
    let typeNode: Node;
    if (typeAlias.getKind() === SyntaxKind.TypeAliasDeclaration) {
      typeNode = (typeAlias as any).getTypeNode();
    }

    if (!typeNode) throw Error(`Could not find type node for ${typeAlias.getText()}`);
    return typeNode;
  }

  private modifyTypeInFile(typeName: string, configuredInterface: string): void {
    try {
      const project = new Project();
      this.sourceFile = project.addSourceFileAtPath(this._outputFilePath);

      if (!this.config.withQueryNameDiscriminator) return;

      const typeNode = this.getTypeNode(typeName);

      this.addQueryNameProperty(typeNode, typeName, configuredInterface);
      this.applyModifications();
    } catch (e) {
      console.log(e);
    }
  }

  private removeExportModifiersFromFile(typeNames: string[]): void {
    if (this.config.withExportedBaseTypes) return;
    for (const typeName of typeNames) {
      const typeAlias = this.getTypeAlias(typeName);
      if (typeAlias.getCombinedModifierFlags() === ModifierFlags.Export) {
        const exportKeyword = (typeAlias as any)
          .getModifiers()
          .find(modifier => modifier.getKind() === SyntaxKind.ExportKeyword);
        if (exportKeyword) {
          this.sourceFile.removeText(exportKeyword.getStart(), exportKeyword.getEnd());
        }
      }
    }
  }

  public getSourceFile(): string {
    return this.sourceFile.getText();
  }

  public findPropertyNames(jsonData: string, targetValue: string): string[] {
    const dataObj: { [key: string]: any } = JSON.parse(jsonData);
    const result: string[] = [];
    const relevantObj = dataObj['types'];
    for (const obj of relevantObj) {
      const fields = obj['fields'];
      if (!fields) continue;
      for (const field of fields) {
        if (this.targetExists(field, targetValue)) {
          result.push(field['name']);
        }
      }
    }
    return result;
  }

  private getQueriedTypeNames(): { [key: string]: string }[] {
    if (!this.config.forEntities || this.config.forEntities.length === 0) {
      throw Error('No entities configured. Please configure entities in the plugin config.');
    }
    const result: { [key: string]: string }[] = [];
    const introspection = JSON.stringify(introspectionFromSchema(this._schema).__schema);
    for (const configuredInterface of this.config.forEntities) {
      const propertyNames = this.findPropertyNames(introspection, configuredInterface);
      for (const propertyName of propertyNames) {
        const entry: { [key: string]: string } = {};
        entry[configuredInterface] = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
        const isDuplicate = result.some(obj => obj[configuredInterface] === entry[configuredInterface]);
        if (isDuplicate) continue;
        result.push(entry);
      }
    }

    return result;
  }

  private generateParentType(
    configuredInterface: string,
    queryName: string,
    selections: readonly SelectionNode[],
  ): {
    fullType: string;
    typeName: string;
  } {
    const sanitizedInterface = this.sanitizeInterfaceName(configuredInterface);
    const { parentNames, optionalType } = this.getAllSelectedParents(
      selections,
      configuredInterface,
      true,
      [],
      queryName,
    );
    const fullType = `export type ${sanitizedInterface}Of${queryName} = ${
      optionalType && optionalType.typeName ? optionalType.typeName : queryName
    }${parentNames};
    
    `;
    const typeName = `${sanitizedInterface}Of${queryName}`;
    return { fullType, typeName };
  }

  private generateTemplateType(configuredInterface: string): string {
    return `
export type ${configuredInterface}Type = ${configuredInterface} & { __typename?: string };
`;
  }

  private generateStateTemplateType(configuredInterface: string, queriedType: string): string {
    const lowerCaseQueriedType = queriedType.charAt(0).toLowerCase() + queriedType.slice(1);

    return `
type ${queriedType}StateTemplate<QueryType, TypeName> = QueryType extends {
  ${lowerCaseQueriedType}: (infer ${configuredInterface}Type)[];
}
  ? Extract<${configuredInterface}Type, { __typename: TypeName }>
  : never;
`;
  }

  private sanitizeInterfaceName(configuredInterface: string): string {
    if (configuredInterface.endsWith('s')) {
      configuredInterface = configuredInterface.slice(0, -1);
    }
    return configuredInterface.charAt(0).toUpperCase() + configuredInterface.slice(1);
  }

  private findColumnOfToken(token: Token, configuredInterface: string): number | undefined {
    if (!token.next) return undefined;
    const lowerCaseInterface =
      configuredInterface.charAt(0).toLowerCase() + configuredInterface.slice(1);
    const pluralInterface = lowerCaseInterface + 's';
    // this selects the column of the "on" keyword
    if (token.value === lowerCaseInterface || token.value === pluralInterface) {
      const correctLocation = this.findInlineFragmentLocation(token);
      return correctLocation.column;
    }
    return this.findColumnOfToken(token.next, configuredInterface);
  }

  private findInlineFragmentLocation(token: Token): Token | undefined {
    if (!token.next) return undefined;
    if (token.kind === TokenKind.SPREAD) {
      // return the next AFTER next because inline frag is: ... on Type
      return token.next.next;
    }
    return this.findInlineFragmentLocation(token.next);
  }

  private getInlineFragmentByColumn(token: Token, relevantColumn: number): Token | undefined {
    if (!token.next) return undefined;
    if (token.prev.prev.kind === TokenKind.SPREAD && token.column === relevantColumn) {
      return token;
    }
    return this.getInlineFragmentByColumn(token.next, relevantColumn);
  }

  private getTokenCollection(node: OperationDefinitionNode, configuredInterface: string): Token[] {
    const tokenCollection: Token[] = [];
    for (const selection of node.selectionSet.selections) {
      const relevantColumn = this.findColumnOfToken(selection.loc.startToken, configuredInterface);
      if (relevantColumn === undefined) continue;
      let activeToken = this.getInlineFragmentByColumn(selection.loc.startToken, relevantColumn);
      if (activeToken === undefined) continue;
      tokenCollection.push(activeToken);
      while (activeToken && activeToken.next) {
        activeToken = this.getInlineFragmentByColumn(activeToken.next, relevantColumn);
        if (activeToken !== undefined) {
          tokenCollection.push(activeToken);
        }
      }
    }

    return tokenCollection;
  }

  private getQueriedTypes(node: OperationDefinitionNode, configuredInterface: string): string[] {
    return uniq(this.getTokenCollection(node, configuredInterface).map(token => token.value));
  }

  private generateHelperFunctions(
    queriedTypes: string[],
    queryName: string,
    interfaceName: string,
    inputType: string,
  ): string[] {
    if (!this.config.withHelperFunctions) return [];
    const result: string[] = [];
    const lowerCaseInterface = interfaceName.charAt(0).toLowerCase() + interfaceName.slice(1) + 's';

    for (const type of queriedTypes) {
      const templateType = `${type}Of${queryName}`;
      const helperFunction =
`
export const get${type}Of${queryName}Of${interfaceName}s = (${lowerCaseInterface}?: ${inputType}[]): ${templateType}[] => {
  if (!${lowerCaseInterface}) return [];
  return getEntitiesByType<${templateType}>(${lowerCaseInterface}, '${type}');
};
`;
      result.push(helperFunction);
    }
    return result;
  }

  private generateTypeGuards(
    queriedTypes: string[],
    queryName: string,
    interfaceName: string,
    inputType: string,
  ): string[] {
    if (!this.config.withTypeGuards) return [];
    const result: string[] = [];

    for (const type of queriedTypes) {
      const templateType = `${type}Of${queryName}`;
      const typeGuard =
`
export const is${interfaceName}Of${queryName}${type} = (
  entity: ${inputType}
): entity is ${templateType} => 
  isEntityOfType<${templateType}>(entity, '${type}');
`;
      result.push(typeGuard);
    }
    return result;
  }

  private selectionHasInterface(
    selections: readonly SelectionNode[],
    configuredInterface: string,
  ): boolean {
    const lowerCaseInterface =
      configuredInterface.charAt(0).toLowerCase() + configuredInterface.slice(1);
    const pluralInterface = lowerCaseInterface + 's';
    const collectedSelectionSets: boolean[] = [];

    for (const selection of selections) {
      if (selection.kind === Kind.FIELD && selection.selectionSet) {
        if (
          selection.name.value === lowerCaseInterface ||
          selection.name.value === pluralInterface
        ) {
          return true;
        }
        if (selection.selectionSet) {
          collectedSelectionSets.push(
            this.selectionHasInterface(selection.selectionSet.selections, configuredInterface),
          );
        }
      }
    }
    return collectedSelectionSets.reduce((acc, curr) => acc || curr, false);
  }

  private findTypeByTypeName(node: Node, typeName: string): Node | void {
    const properties = node.getDescendantsOfKind(SyntaxKind.PropertySignature);
    const typenameProperty = properties.find(prop => prop.getNameNode().getText() === typeName);
    if (typenameProperty) {
      return typenameProperty.getTypeNodeOrThrow();
    }
  }

  private parseParentNamesToTypeSelection(parentNames: string[], queryName: string): TypeSelection {
    let typeWithNoOptionals = '';
    let typeWithOptionals = '';
    let nullableTypeName = '';
    const typeNode = this.getTypeNode(queryName);
    for (const parentName of parentNames) {
      let isArrayType = false;
      let isNullable = false;
      const parentType = this.findTypeByTypeName(typeNode, parentName);
      if (!parentType) throw Error(`Could not find type for ${parentName}`);
      if (parentType.getKind() === SyntaxKind.TypeReference) {
        const typeRef = parentType as TypeReferenceNode;
        if (typeRef.getTypeName().getText() === 'Array') {
          isArrayType = true;
        }
      }
      if (parentType.getKind() === SyntaxKind.UnionType) {
        const unionTypes = (parentType as UnionTypeNode).getTypeNodes();
        isNullable = unionTypes.some(type => type.getKind() === SyntaxKind.UndefinedKeyword);
        if (isNullable) {
          nullableTypeName = `NonNullableTypeOf${queryName}`;
          typeWithOptionals = `
            type ${nullableTypeName} = NonNullable<${queryName}['${parentName}']>;`;
          // If we have found and populated the optionalType we need to skip selecting the following node
          continue;
        }
      }
      typeWithNoOptionals += `['${parentName}']${isArrayType ? '[number]' : ''}`;
    }
    return {
      parentNames: typeWithNoOptionals,
      optionalType: { typeName: nullableTypeName, typeNode: typeWithOptionals },
    };
  }

  private getAllSelectedParents(
    selections: readonly SelectionNode[],
    configuredInterface: string,
    selectItself: boolean,
    resultingParentNames: string[],
    queryName,
  ): TypeSelection {
    const lowerCaseInterface =
      configuredInterface.charAt(0).toLowerCase() + configuredInterface.slice(1);
    const pluralInterface = lowerCaseInterface + 's';
    for (const selection of selections) {
      if (selection.kind === Kind.FIELD) {
        if (
          selection.selectionSet &&
          this.selectionHasInterface(selection.selectionSet.selections, configuredInterface)
        ) {
          resultingParentNames.push(selection.name.value);
        }
        if (
          selection.name.value === lowerCaseInterface ||
          selection.name.value === pluralInterface
        ) {
          if (selectItself) {
            resultingParentNames.push(selection.name.value);
          }
          return this.parseParentNamesToTypeSelection(resultingParentNames, queryName);
        }
        if (
          selection.selectionSet &&
          this.selectionHasInterface(selection.selectionSet.selections, configuredInterface)
        ) {
          return this.getAllSelectedParents(
            selection.selectionSet.selections,
            configuredInterface,
            selectItself,
            resultingParentNames,
            queryName,
          );
        }
      }
    }
    return { parentNames: '' };
  }

  private generateTemplateTypes(
    queriedTypes: string[],
    queryName: string,
    interfaceName: string,
    _node: OperationDefinitionNode,
  ): string[] {
    const result: string[] = [];

    const { parentNames, optionalType } = this.getAllSelectedParents(
      _node.selectionSet.selections,
      interfaceName,
      false,
      [],
      queryName,
    );

    if (optionalType && optionalType.typeNode) {
      result.push(optionalType.typeNode);
    }

    for (const type of queriedTypes) {
      const genericArg = optionalType && optionalType.typeName ? optionalType.typeName : queryName;
      const template = `export type ${type}Of${queryName} = ${interfaceName}StateTemplate<${genericArg}${parentNames}, '${type}'>;

       `;
      result.push(template);
    }
    return result;
  }

  public buildTemplates(): string {
    const templates: string[] = [
      `
const isEntityOfType = <T,>(entity: any, typename: string): entity is T => entity.__typename === typename;

const getEntitiesByType = <T,>(entities: any[], typename: string): T[] => {
  return entities.reduce<T[]>((filteredEntities, item) => {
    if (isEntityOfType<T>(item, typename)) {
      return [...filteredEntities, item];
    }
    return filteredEntities;
  }, []);
};
`,
    ];

    for (const configuredInterface of this.config.forEntities) {
      templates.push(this.generateTemplateType(configuredInterface));
    }

    for (const configuredInterfaces of this.configuredInterfaces) {
      for (const configuredInterface in configuredInterfaces) {
        templates.push(
          this.generateStateTemplateType(
            configuredInterface,
            configuredInterfaces[configuredInterface],
          ),
        );
      }
    }

    return templates.join('\n');
  }

  protected buildOperation(
    _node: OperationDefinitionNode,
    _documentVariableName: string,
    _operationType: string,
    _operationResultType: string,
    _operationVariablesTypes: string,
    _hasRequiredVariables: boolean,
  ): string {
    const result: string[] = [];
    for (const configuredInterfaces of this.configuredInterfaces) {
      for (const key in configuredInterfaces) {
        const queriedType = configuredInterfaces[key];
        if (_node.operation === OperationTypeNode.QUERY) {
          try {
            const body = _node.loc.source.body;
            const convertedQuery = this.convertName(body);
            if (!convertedQuery.includes('On') || !convertedQuery.includes(queriedType)) {
              continue;
            }

            const queryName = this.convertName(_node) + 'Query';
            this.modifyTypeInFile(queryName, queriedType);
            const parentType = this.generateParentType(
              queriedType,
              queryName,
              _node.selectionSet.selections,
            );
            const queriedTypes = this.getQueriedTypes(
              _node,
              this.sanitizeInterfaceName(queriedType),
            );
            this.removeExportModifiersFromFile(queriedTypes);
            const templateTypes = this.generateTemplateTypes(
              queriedTypes,
              queryName,
              queriedType,
              _node,
            ).join('\n');
            const typeGuards = this.generateTypeGuards(
              queriedTypes,
              queryName,
              key,
              parentType.typeName,
            ).join('\n');
            const helperFunctions = this.generateHelperFunctions(
              queriedTypes,
              queryName,
              key,
              parentType.typeName,
            ).join('\n');

            result.push(`${templateTypes}
${parentType.fullType}${typeGuards}${helperFunctions}`);
          } catch (e) {
            console.error(e);
            throw e;
          }
        }
      }
    }
    return result.join('\n');
  }
}
