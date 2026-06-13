import { createRequire } from 'node:module';

// Inject it into the global scope so dependencies can see it
// This is a hack since `@graphql-codegen/testing`'s `validateTs` was written for CJS
globalThis.require = createRequire(import.meta.url);
