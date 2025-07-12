import autoBind from 'auto-bind';
import { pascalCase } from 'change-case-all';
import {
  DirectiveNode,
  DocumentNode,
  EnumTypeDefinitionNode,
  FieldNode,
  FragmentSpreadNode,
  GraphQLSchema,
  InputObjectTypeDefinitionNode,
  isEnumType,
  isInputObjectType,
  isScalarType,
  Kind,
  ObjectTypeDefinitionNode,
  OperationDefinitionNode,
  print,
  TypeNode,
  VariableDefinitionNode,
  visit,
} from 'graphql';
import {
  C_SHARP_SCALARS,
  convertSafeName,
  CSharpDeclarationBlock,
  CSharpFieldType,
  getJsonAttributeSourceConfiguration,
  getListInnerTypeNode,
  getListTypeDepth,
  getListTypeField,
  getMemberNamingFunction,
  isValueType,
  JsonAttributesSourceConfiguration,
  MemberNamingFn,
  wrapFieldType,
} from '@graphql-codegen/c-sharp-common';
import { getCachedDocumentNodeFromSchema, Types } from '@graphql-codegen/plugin-helpers';
import {
  buildScalarsFromConfig,
  ClientSideBasePluginConfig,
  ClientSideBaseVisitor,
  DocumentMode,
  getBaseTypeNode,
  indent,
  indentMultiline,
  LoadedFragment,
} from '@graphql-codegen/visitor-plugin-common';
import { CSharpOperationsRawPluginConfig } from './config.js';

const defaultSuffix = 'GQL';
const R_NAME = /name:\s*"([^"]+)"/;

function R_DEF(directive: string) {
  return new RegExp(`\\s+\\@${directive}\\([^)]+\\)`, 'gm');
}

export interface CSharpOperationsPluginConfig extends ClientSideBasePluginConfig {
  namespaceName: string;
  namedClient: string;
  querySuffix: string;
  mutationSuffix: string;
  subscriptionSuffix: string;
  typesafeOperation: boolean;
  jsonAttributesConfiguration: JsonAttributesSourceConfiguration;
  memberNamingFunction: MemberNamingFn;
}

export class CSharpOperationsVisitor extends ClientSideBaseVisitor<
  CSharpOperationsRawPluginConfig,
  CSharpOperationsPluginConfig
> {
  private _operationsToInclude: {
    node: OperationDefinitionNode;
    documentVariableName: string;
    operationType: string;
    operationResultType: string;
    operationVariablesTypes: string;
  }[] = [];

  private _schemaAST: DocumentNode;
  private readonly _fragmentList: LoadedFragment[];

  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    rawConfig: CSharpOperationsRawPluginConfig,
    documents?: Types.DocumentFile[],
  ) {
    super(
      schema,
      fragments,
      rawConfig,
      {
        namespaceName: rawConfig.namespaceName || 'GraphQLCodeGen',
        namedClient: rawConfig.namedClient,
        querySuffix: rawConfig.querySuffix || defaultSuffix,
        mutationSuffix: rawConfig.mutationSuffix || defaultSuffix,
        subscriptionSuffix: rawConfig.subscriptionSuffix || defaultSuffix,
        jsonAttributesConfiguration: getJsonAttributeSourceConfiguration(
          rawConfig.jsonAttributesSource || 'Newtonsoft.Json',
        ),
        scalars: buildScalarsFromConfig(schema, rawConfig, C_SHARP_SCALARS),
        typesafeOperation: rawConfig.typesafeOperation || false,
        memberNamingFunction: getMemberNamingFunction(rawConfig),
      },
      documents,
    );

    this.overruleConfigSettings();
    autoBind(this);

    this._schemaAST = getCachedDocumentNodeFromSchema(schema);
    this._fragmentList = fragments;
  }

  // Some settings aren't supported with C#, overruled here
  private overruleConfigSettings() {
    if (this.config.documentMode === DocumentMode.graphQLTag) {
      // C# operations does not (yet) support graphQLTag mode
      this.config.documentMode = DocumentMode.documentNode;
    }
  }

  private _operationHasDirective(operation: string | OperationDefinitionNode, directive: string) {
    if (typeof operation === 'string') {
      return operation.includes(`${directive}`);
    }

    let found = false;

    visit(operation, {
      Directive(node) {
        if (node.name.value === directive) {
          found = true;
        }
      },
    });

    return found;
  }

  private _extractDirective(operation: OperationDefinitionNode, directive: string) {
    const directives = print(operation).match(R_DEF(directive));

    if (directives.length > 1) {
      throw new Error(
        `The ${directive} directive used multiple times in '${operation.name}' operation`,
      );
    }

    return directives[0];
  }

  private _namedClient(operation: OperationDefinitionNode): string {
    let name: string;

    if (this._operationHasDirective(operation, 'namedClient')) {
      name = this._extractNamedClient(operation);
    } else if (this.config.namedClient) {
      name = this.config.namedClient;
    }

    return name ? `client = '${name}';` : '';
  }

  private _extractNamedClient(operation: OperationDefinitionNode): string {
    const [, name] = this._extractDirective(operation, 'namedClient').match(R_NAME);

    return name;
  }

  protected _gql(node: OperationDefinitionNode): string {
    const includeNestedFragments =
      this.config.documentMode === DocumentMode.documentNode ||
      this.config.documentMode === DocumentMode.string ||
      (this.config.dedupeFragments && node.kind === 'OperationDefinition');
    const fragmentNames = this._extractFragments(node, includeNestedFragments);
    const fragments = this._transformFragments(fragmentNames);
    const doc = this._prepareDocument(
      [print(node), this._includeFragments(fragments, node.kind)].join('\n'),
    );

    return doc.replace(/"/g, '""');
  }

  private _getDocumentNodeVariable(
    node: OperationDefinitionNode,
    documentVariableName: string,
  ): string {
    return this.config.documentMode === DocumentMode.external
      ? `Operations.${node.name.value}`
      : documentVariableName;
  }

  private _gqlInputSignature(variable: VariableDefinitionNode): {
    signature: string;
    required: boolean;
  } {
    const typeNode = variable.type;
    const innerType = getBaseTypeNode(typeNode);
    const schemaType = this._schema.getType(innerType.name.value);

    const name = variable.variable.name.value;
    const baseType = !isScalarType(schemaType)
      ? innerType.name.value
      : this.scalars[schemaType.name].input || 'object';

    const listType = getListTypeField(typeNode);
    const required = getListInnerTypeNode(typeNode).kind === Kind.NON_NULL_TYPE;

    return {
      required: listType ? listType.required : required,
      signature: !listType
        ? `${name}=(${baseType})`
        : `${name}=(${baseType}${'[]'.repeat(getListTypeDepth(listType))})`,
    };
  }

  public getCSharpImports(): string {
    return (
      [
        'System',
        this.config.jsonAttributesConfiguration.namespace,
        'GraphQL',
        'GraphQL.Client.Abstractions',
      ]
        .map(i => `using ${i};`)
        .join('\n') + '\n'
    );
  }

  private _operationSuffix(operationType: string): string {
    switch (operationType) {
      case 'query':
        return this.config.querySuffix;
      case 'mutation':
        return this.config.mutationSuffix;
      case 'subscription':
        return this.config.subscriptionSuffix;
      default:
        return defaultSuffix;
    }
  }

  protected resolveFieldType(
    typeNode: TypeNode,
    hasDefaultValue: boolean = false,
  ): CSharpFieldType {
    const innerType = getBaseTypeNode(typeNode);
    const schemaType = this._schema.getType(innerType.name.value);
    const listType = getListTypeField(typeNode);
    const required = getListInnerTypeNode(typeNode).kind === Kind.NON_NULL_TYPE;

    let result: CSharpFieldType = null;

    if (isScalarType(schemaType)) {
      if (this.scalars[schemaType.name]) {
        const baseType = this.scalars[schemaType.name];
        result = new CSharpFieldType({
          baseType: {
            type: baseType.output,
            required,
            valueType: isValueType(baseType.output),
          },
          listType,
        });
      } else {
        result = new CSharpFieldType({
          baseType: {
            type: 'object',
            required,
            valueType: false,
          },
          listType,
        });
      }
    } else if (isInputObjectType(schemaType)) {
      result = new CSharpFieldType({
        baseType: {
          type: `${this.convertName(schemaType.name)}`,
          required,
          valueType: false,
        },
        listType,
      });
    } else if (isEnumType(schemaType)) {
      result = new CSharpFieldType({
        baseType: {
          type: this.convertName(schemaType.name),
          required,
          valueType: true,
        },
        listType,
      });
    } else {
      result = new CSharpFieldType({
        baseType: {
          type: `${schemaType.name}`,
          required,
          valueType: false,
        },
        listType,
      });
    }

    if (hasDefaultValue) {
      // Required field is optional when default value specified, see #4273
      (result.listType || result.baseType).required = false;
    }

    return result;
  }

  private _getResponseFieldRecursive(
    node: OperationDefinitionNode | FieldNode | FragmentSpreadNode | DirectiveNode,
    parentSchema: ObjectTypeDefinitionNode,
    seenClasses: undefined | Set<string>,
  ): string {
    switch (node.kind) {
      case Kind.OPERATION_DEFINITION: {
        const classes = new Set<string>();
        return new CSharpDeclarationBlock()
          .access('public')
          .asKind('class')
          .withName('Response')
          .withBlock(
            '\n' +
              node.selectionSet.selections
                .map(opr => {
                  if (opr.kind !== Kind.FIELD) {
                    throw new Error(`Unknown kind; ${opr.kind} in OperationDefinitionNode`);
                  }
                  return this._getResponseFieldRecursive(opr, parentSchema, classes);
                })
                .join('\n'),
          ).string;
      }
      case Kind.FIELD: {
        const fieldSchema = parentSchema.fields.find(f => f.name.value === node.name.value);
        if (!fieldSchema) {
          throw new Error(`Field schema not found; ${node.name.value}`);
        }
        const responseType = this.resolveFieldType(fieldSchema.type);

        if (!node.selectionSet) {
          const responseTypeName = wrapFieldType(
            responseType,
            responseType.listType,
            'System.Collections.Generic.List',
          );
          const propertyName = convertSafeName(
            this._parsedConfig.memberNamingFunction(node.name.value),
          );
          return indentMultiline(
            [
              `[${this.config.jsonAttributesConfiguration.propertyAttribute}("${node.name.value}")]`,
              `public ${responseTypeName} ${propertyName} { get; set; }`,
            ].join('\n') + '\n',
          );
        }

        // Earlier versions of this codegen generated a class name based on the
        // base type for each selection set.
        // Subsequent classes will use the selection name to prevent duplicates.
        const baseTypeSelectionName = `${responseType.baseType.type}Selection`;
        const selectionBaseTypeName = seenClasses?.has(baseTypeSelectionName)
          ? pascalCase(`${node.name.value}Selection`)
          : baseTypeSelectionName;

        seenClasses.add(selectionBaseTypeName);

        const selectionType = Object.assign(new CSharpFieldType(responseType), {
          baseType: { type: selectionBaseTypeName },
        });
        const selectionTypeName = wrapFieldType(
          selectionType,
          selectionType.listType,
          'System.Collections.Generic.List',
        );
        const innerClassSchema = this._schemaAST.definitions.find(
          d =>
            d.kind === Kind.OBJECT_TYPE_DEFINITION && d.name.value === responseType.baseType.type,
        ) as ObjectTypeDefinitionNode;

        const classes = new Set<string>();
        const innerClassDefinition = new CSharpDeclarationBlock()
          .access('public')
          .asKind('class')
          .withName(convertSafeName(selectionBaseTypeName))
          .withBlock(
            '\n' +
              node.selectionSet.selections
                .map(s => {
                  if (s.kind === Kind.INLINE_FRAGMENT) {
                    throw new Error(`Unsupported kind; ${node.name} ${s.kind}`);
                  }
                  return this._getResponseFieldRecursive(s, innerClassSchema, classes);
                })
                .join('\n'),
          ).string;
        const propertyName = convertSafeName(
          this._parsedConfig.memberNamingFunction(node.name.value),
        );
        return indentMultiline(
          [
            innerClassDefinition,
            `[${this.config.jsonAttributesConfiguration.propertyAttribute}("${node.name.value}")]`,
            `public ${selectionTypeName} ${propertyName} { get; set; }`,
          ].join('\n') + '\n',
        );
      }
      case Kind.FRAGMENT_SPREAD: {
        const fragmentSchema = this._fragmentList.find(f => f.name === node.name.value);
        if (!fragmentSchema) {
          throw new Error(`Fragment schema not found; ${node.name.value}`);
        }
        const classes = new Set<string>();
        return fragmentSchema.node.selectionSet.selections
          .map(s => {
            if (s.kind === Kind.INLINE_FRAGMENT) {
              throw new Error(`Unsupported kind; ${node.name} ${s.kind}`);
            }
            return this._getResponseFieldRecursive(s, parentSchema, classes);
          })
          .join('\n');
      }
      default: {
        return '';
      }
    }
  }

  private _getResponseClass(node: OperationDefinitionNode): string {
    const operationSchema = this._schemaAST.definitions.find(
      s => s.kind === Kind.OBJECT_TYPE_DEFINITION && s.name.value.toLowerCase() === node.operation,
    );
    return this._getResponseFieldRecursive(
      node,
      operationSchema as ObjectTypeDefinitionNode,
      undefined,
    );
  }

  private _getVariablesClass(node: OperationDefinitionNode): string {
    if (!node.variableDefinitions?.length) {
      return '';
    }
    return new CSharpDeclarationBlock()
      .access('public')
      .asKind('class')
      .withName('Variables')
      .withBlock(
        '\n' +
          node.variableDefinitions
            ?.map(v => {
              const inputType = this.resolveFieldType(v.type);
              const inputTypeName = wrapFieldType(
                inputType,
                inputType.listType,
                'System.Collections.Generic.List',
              );
              const propertyName = convertSafeName(
                this._parsedConfig.memberNamingFunction(v.variable.name.value),
              );
              return indentMultiline(
                [
                  `[${this.config.jsonAttributesConfiguration.propertyAttribute}("${v.variable.name.value}")]`,
                  `public ${inputTypeName} ${propertyName} { get; set; }`,
                ].join('\n') + '\n',
              );
            })
            .join('\n'),
      ).string;
  }

  private _getOperationMethod(node: OperationDefinitionNode): string {
    const operationSchema = this._schemaAST.definitions.find(
      s => s.kind === Kind.OBJECT_TYPE_DEFINITION && s.name.value.toLowerCase() === node.operation,
    ) as ObjectTypeDefinitionNode;
    if (!operationSchema) {
      throw new Error(`Operation schema not found; ${node.operation}`);
    }

    const variablesArgument = node.variableDefinitions?.length ? ', Variables variables' : '';

    switch (node.operation) {
      case 'query':
      case 'mutation':
        return [
          `public static System.Threading.Tasks.Task<GraphQLResponse<Response>> Send${operationSchema.name.value}Async(IGraphQLClient client${variablesArgument}, System.Threading.CancellationToken cancellationToken = default) {`,
          indent(
            `return client.Send${operationSchema.name.value}Async<Response>(Request(${
              node.variableDefinitions?.length ? 'variables' : ''
            }), cancellationToken);`,
          ),
          `}`,
        ].join('\n');
      case 'subscription': {
        return [
          `public static System.IObservable<GraphQLResponse<Response>> CreateSubscriptionStream(IGraphQLClient client${variablesArgument}) {`,
          indent(
            `return client.CreateSubscriptionStream<Response>(Request(${
              node.variableDefinitions?.length ? 'variables' : ''
            }));`,
          ),
          `}`,
          '',
          `public static System.IObservable<GraphQLResponse<Response>> CreateSubscriptionStream(IGraphQLClient client${variablesArgument}, System.Action<System.Exception> exceptionHandler) {`,
          indent(
            `return client.CreateSubscriptionStream<Response>(Request(${
              node.variableDefinitions?.length ? 'variables' : ''
            }), exceptionHandler);`,
          ),
          `}`,
        ].join('\n');
      }
    }
    throw new Error(`Unexpected operation type: ${node.operation}`);
  }

  public OperationDefinition(node: OperationDefinitionNode): string {
    if (!node.name || !node.name.value) {
      return null;
    }

    this._collectedOperations.push(node);

    const documentVariableName = this.convertName(node, {
      suffix: this.config.documentVariableSuffix,
      prefix: this.config.documentVariablePrefix,
      useTypesPrefix: false,
    });

    let documentString = '';
    if (this.config.documentMode !== DocumentMode.external) {
      const gqlBlock = indentMultiline(this._gql(node), 4);
      documentString = `${this.config.noExport ? '' : 'public'} static string ${convertSafeName(
        documentVariableName,
      )} = @"\n${gqlBlock}";`;
    }

    const operationType: string = node.operation;
    const operationTypeSuffix: string =
      this.config.dedupeOperationSuffix && node.name.value.toLowerCase().endsWith(node.operation)
        ? ''
        : !operationType
          ? ''
          : operationType;

    const operationResultType: string = this.convertName(node, {
      suffix: operationTypeSuffix + this._parsedConfig.operationResultSuffix,
    });
    const operationVariablesTypes: string = this.convertName(node, {
      suffix: operationTypeSuffix + 'Variables',
    });

    const serviceName = `${this.convertName(node)}${this._operationSuffix(operationType)}`;
    this._operationsToInclude.push({
      node,
      documentVariableName,
      operationType,
      operationResultType,
      operationVariablesTypes,
    });

    const inputSignatures = node.variableDefinitions?.map(v => this._gqlInputSignature(v));
    const hasInputArgs = !!inputSignatures?.length;
    const inputArgsHint = hasInputArgs
      ? `
      /// <para>Required variables:<br/> { ${inputSignatures
        .filter(sig => sig.required)
        .map(sig => sig.signature)
        .join(', ')} }</para>
      /// <para>Optional variables:<br/> { ${inputSignatures
        .filter(sig => !sig.required)
        .map(sig => sig.signature)
        .join(', ')} }</para>`
      : '';

    // Should use ObsoleteAttribute but VS treats warnings as errors which would be super annoying so use remarks comment instead
    const obsoleteMessage = '/// <remarks>This method is obsolete. Use Request instead.</remarks>';

    let typesafeOperations = '';
    if (this.config.typesafeOperation) {
      typesafeOperations = `
${this._getVariablesClass(node)}
${this._getResponseClass(node)}
${this._getOperationMethod(node)}
`;
      typesafeOperations = indentMultiline(typesafeOperations, 3);
    }

    const content = `
    public class ${serviceName} {
      /// <summary>
      /// ${serviceName}.Request ${inputArgsHint}
      /// </summary>
      public static GraphQLRequest Request(${hasInputArgs ? 'object variables = null' : ''}) {
        return new GraphQLRequest {
          Query = ${this._getDocumentNodeVariable(node, documentVariableName)},
          OperationName = "${node.name.value}"${
            hasInputArgs
              ? `,
          Variables = variables`
              : ''
          }
        };
      }

      ${obsoleteMessage}
      public static GraphQLRequest get${serviceName}() {
        return Request();
      }
      ${this._namedClient(node)}
      ${documentString}
      ${typesafeOperations}
    }
    `;
    return [content].filter(a => a).join('\n');
  }

  public InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    if (!this.config.typesafeOperation) {
      return '';
    }

    const inputClass = new CSharpDeclarationBlock()
      .access('public')
      .asKind('class')
      .withName(convertSafeName(this.convertName(node)))
      .withBlock(
        '\n' +
          node.fields
            ?.map(f => {
              if (f.kind !== Kind.INPUT_VALUE_DEFINITION) {
                return null;
              }
              const inputType = this.resolveFieldType(f.type);
              const inputTypeName = wrapFieldType(
                inputType,
                inputType.listType,
                'System.Collections.Generic.List',
              );
              const propertyName = convertSafeName(
                this._parsedConfig.memberNamingFunction(f.name.value),
              );
              return indentMultiline(
                [
                  `[${this.config.jsonAttributesConfiguration.propertyAttribute}("${f.name.value}")]`,
                  `public ${inputTypeName} ${propertyName} { get; set; }`,
                ].join('\n') + '\n',
              );
            })
            .filter(f => !!f)
            .join('\n'),
      ).string;

    return indentMultiline(inputClass, 2);
  }

  public EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    if (!this.config.typesafeOperation) {
      return '';
    }

    const enumDefinition = new CSharpDeclarationBlock()
      .access('public')
      .asKind('enum')
      .withName(convertSafeName(this.convertName(node.name)))
      .withBlock(
        indentMultiline(
          node.values
            ?.map(
              v =>
                `${this.config.jsonAttributesConfiguration.enumConfiguration.enumMemberAttribute(v.name.value)}\n${this._parsedConfig.memberNamingFunction(v.name.value)}`,
            )
            .join(',\n'),
        ),
      );

    const enumWithAttributes = `${this.config.jsonAttributesConfiguration.enumConfiguration.decorator}\n${enumDefinition.string}`;

    return indentMultiline(enumWithAttributes, 2);
  }
}
