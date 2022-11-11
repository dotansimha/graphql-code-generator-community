import { FlutterFreezedPluginConfig } from '../config';
import {
  // buildBlockComment,
  // buildBlockDecorators,
  buildBlockHeader,
  NodeType,
  FieldType,
} from '../utils';

export class FreezedParameterBlock {
  public static build(
    config: FlutterFreezedPluginConfig,
    node: NodeType,
    blockType: 'parameter',
    field: FieldType
  ): string {
    let block = '';

    // TODO: Implement comments(multi-line) and decoratos
    // block += buildBlockComment(node);
    // block += buildBlockDecorators(node, config);
    block += buildBlockHeader(config, node, blockType, field);
    return block;
  }
}
