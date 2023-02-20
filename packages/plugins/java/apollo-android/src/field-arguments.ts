import {
  ArgumentNode,
  FieldNode,
  FloatValueNode,
  IntValueNode,
  ObjectFieldNode,
  ObjectValueNode,
  StringValueNode,
  VariableNode,
} from 'graphql';
import { oldVisit } from '@graphql-codegen/plugin-helpers';
import { Imports } from './imports.js';
import { ImportsSet } from './types.js';

export function visitFieldArguments(selection: FieldNode, imports: ImportsSet): string {
  if (!selection.arguments || selection.arguments.length === 0) {
    return 'null';
  }

  imports.add(Imports.UnmodifiableMapBuilder);
  imports.add(Imports.String);
  imports.add(Imports.Object);

  return oldVisit(selection, {
    leave: {
      Field: (node: FieldNode) => {
        return (
          `new UnmodifiableMapBuilder<String, Object>(${node.arguments.length})` +
          node.arguments.join('') +
          '.build()'
        );
      },
      Argument: (node: ArgumentNode) => {
        return `.put("${node.name.value}", ${node.value})`;
      },
      ObjectValue: (node: ObjectValueNode) => {
        return (
          `new UnmodifiableMapBuilder<String, Object>(${node.fields.length})` +
          node.fields.join('') +
          '.build()'
        );
      },
      ObjectField: (node: ObjectFieldNode) => {
        return `.put("${node.name.value}", ${node.value})`;
      },
      Variable: (node: VariableNode) => {
        return `new UnmodifiableMapBuilder<String, Object>(2).put("kind", "Variable").put("variableName", "${node.name.value}").build()`;
      },
      StringValue: (node: StringValueNode) => `"${node.value}"`,
      IntValue: (node: IntValueNode) => `"${node.value}"`,
      FloatValue: (node: FloatValueNode) => `"${node.value}"`,
    },
  });
}
