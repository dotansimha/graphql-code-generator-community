import { buildClientSchema, parse } from 'graphql';
import { plugin } from '../src/index.js';

describe('jit-sdk - GraphQL 16+', () => {
  it('generates operation description correctly', async () => {
    const schema = buildClientSchema(require('../../../../../dev-test/githunt/schema.json'));

    const content = await plugin(
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
      { outputFile: 'graphql.tsx' },
    );

    expect(content).toMatchSnapshot();
  });
});
