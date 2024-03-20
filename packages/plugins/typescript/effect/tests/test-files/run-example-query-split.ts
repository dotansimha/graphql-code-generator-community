import { Effect } from 'effect';
import { NodeHttpClient } from '@effect/platform-node';
import { GraphQLClient } from './effect-client.js';
import { Add } from './effect-sdk.js';

export const exampleQueries = (endpoint: string) => ({
  add: (x: number, y: number) =>
    Add({ x, y }).pipe(
      Effect.provide(GraphQLClient.fromEndpoint(endpoint)),
      Effect.provide(NodeHttpClient.layer),
      Effect.runPromise,
    ),
});
