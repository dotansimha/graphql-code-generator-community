import { Kind } from 'graphql';
import { FlutterFreezedPluginConfig } from '../config';
import {
  buildBlockComment,
  buildBlockDecorators,
  buildBlockHeader,
  buildBlockBody,
  buildBlockFooter,
  NodeType,
} from '../utils';

export class FreezedDeclarationBlock {
  public static build(config: FlutterFreezedPluginConfig, node: NodeType): string {
    const blockType = node.kind === Kind.ENUM_TYPE_DEFINITION ? 'enum' : 'class';
    const blockName = node.name.value;

    let block = '';

    block += buildBlockComment(node);
    block += buildBlockDecorators(config, node);
    block += buildBlockHeader(config, node, blockType);
    block += buildBlockBody(config, node, blockType);
    block += buildBlockFooter(config, node, blockType, blockName);
    return block;
  }
}
