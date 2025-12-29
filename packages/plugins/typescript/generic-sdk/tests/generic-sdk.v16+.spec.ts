import { buildClientSchema, extendSchema, parse } from 'graphql';
import { plugin } from '../src/index.js';

describe('generic-sdk - GraphQL v16+', () => {
  it('generates operation description correctly', async () => {
    const schema = extendSchema(
      buildClientSchema(require('../../../../../dev-test/githunt/schema.json')),
      parse(/* GraphQL */ `
        directive @live on QUERY
      `),
    );

    const result = await plugin(
      schema,
      [
        {
          location: '',
          document: parse(/* GraphQL */ `
            """description (becomes JSDoc)"""
            query feed {
              feed {
                id
                commentCount
                repository {
                  owner {
                    avatar_url
                  }
                }
              }
            }
          `),
        },
      ],
      {},
      { outputFile: 'graphql.ts' },
    );
    expect(result).toMatchSnapshot();
  });
});
