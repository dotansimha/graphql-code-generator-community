import { buildSchema } from 'graphql';
import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { plugin } from '../src/index.js';

const SCHEMA = `
  type User {
    id: ID!
    name: String!
  }

  type Address {
    id: String
    city: String!
    postalCode: String!
    stateProvince: String!
    street: String!
  }

  input AddressInput {
    id: String
    city: String!
    postalCode: String!
    stateProvince: String!
    street: String!
  }

  input UserInput {
    id: String
    name: String
    address: AddressInput
  }
`;

describe('class-transformer-decorators', () => {
  it('should decorate @Expose() on matching class properties and @Type on all nested classes', async () => {
    const schema = buildSchema(SCHEMA);
    const result = mergeOutputs([
      await plugin(schema, [], {
        classWhitelist: ['User'],
        classNamePattern: '.*Input$',
        declarationKind: 'class',
      }),
    ]);

    expect(result).toMatchSnapshot();
  });
});
