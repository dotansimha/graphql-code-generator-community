import { GraphQLClient } from 'graphql-request';
import fetch from 'node-fetch'; // FIXME: using `node-fetch` temporarily because `graphql-request@7` uses native fetch, which `nock@13.4` from `@graphql-codegen/testing` does not support
import { getSdk } from './graphql-request-sdk.js';

export function runExampleQuery(x: number, y: number) {
  const client = new GraphQLClient('http://localhost:4000/graphql', { fetch });
  const sdk = getSdk(client);
  return sdk.Add({ x, y });
}
