import { Effect, Layer } from 'effect';
import { NodeHttpClient } from '@effect/platform-node';
import * as Http from '@effect/platform/HttpClient';
import { Add } from './effect-sdk.js';

const HttpClientLive = Layer.effect(
  Http.client.Client,
  Effect.map(
    Http.client.Client,
    Http.client.mapRequest(Http.request.prependUrl('http://localhost:4000/graphql')),
  ),
).pipe(Layer.provide(NodeHttpClient.layer));

export const runExampleQuery = (x: number, y: number) => {
  return Add({ x, y }).pipe(Effect.provide(HttpClientLive), Effect.runPromise);
};
