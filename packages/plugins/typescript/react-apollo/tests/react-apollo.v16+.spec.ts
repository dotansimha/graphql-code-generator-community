import { buildClientSchema, parse } from 'graphql';
import { plugin } from '../src/index.js';

describe('React Apollo - GraphQL v16+', () => {
  it('generates operation description correctly', async () => {
    const schema = buildClientSchema(require('../../../../../dev-test/githunt/schema.json'));

    const content = await plugin(
      schema,
      [
        {
          location: '',
          document: parse(/* GraphQL */ `
            """description for feed"""
            query Test {
              feed {
                id
                commentCount
                repository {
                  full_name
                  html_url
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
