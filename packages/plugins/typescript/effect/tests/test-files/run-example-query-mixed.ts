import { Effect, Layer } from 'effect';
import { NodeHttpClient } from '@effect/platform-node';
import { Add, GraphQLClient } from './effect-sdk.js';

export const exampleQueries = (endpoint: string) => ({
  add: (x: number, y: number) =>
    Add({ x, y }).pipe(
      Effect.provide(
        GraphQLClient.fromEndpoint(endpoint).pipe(Layer.provide(NodeHttpClient.layer)),
      ),
      Effect.runPromise,
    ),
});
