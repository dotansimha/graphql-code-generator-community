import { transformSchemaAST } from '@graphql-codegen/schema-ast';
import { defaultFreezedPluginConfig, ObjectType } from '../src/config/plugin-config';
import { NodeRepository } from '../src/freezed-declaration-blocks/node-repository';
import { unionSchema } from './schema';

const {
  ast: { definitions: nodes },
} = transformSchemaAST(unionSchema, defaultFreezedPluginConfig);

describe('NodeRepository can store and retrieve Object Types', () => {
  const nodeRepository = new NodeRepository();
  it('returns node or undefined', () => {
    expect(nodeRepository.get('Human')).toBeUndefined();

    const objNode = nodeRepository.register(nodes[4] as ObjectType);
    expect(nodeRepository.get('Human')).toBe(objNode);

    expect(() => nodeRepository.register(nodes[6] as ObjectType)).toThrow(
      'Node is not an ObjectTypeDefinitionNode or InputObjectTypeDefinitionNode'
    );
    expect(nodeRepository.get('SearchResult')).toBeUndefined();
  });
});
