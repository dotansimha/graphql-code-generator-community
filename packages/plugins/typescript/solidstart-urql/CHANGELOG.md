# Changelog

## [1.0.0] - 2026-01-13

### Added
- Initial release of GraphQL Code Generator plugin for SolidStart and URQL
- Support for generating typed query functions using `createQuery` from `@urql/solid-start`
- Support for generating typed mutation functions using `createMutation` from `@urql/solid-start`
- Configuration option `withPrimitives` to enable/disable primitive generation
- Configuration option `urqlImportFrom` to customize import source
- Full TypeScript support with proper type inference
- Comprehensive documentation with correct SolidStart and URQL API usage

### Features
- Generates query functions that wrap `@urql/solid-start`'s `createQuery` primitive
- Generates mutation functions that wrap `@urql/solid-start`'s `createMutation` primitive
- Query, mutation, and subscription generation
- Optimized for SolidStart's server-side rendering with `createAsync`
- Proper handling of required vs optional variables
- Compatible with @urql/core and @urql/solid-start
- Follows SolidStart conventions with `query*`, `action*`, and `useSubscription*` naming
- Automatic kebab-case cache key generation for queries

### API Design
- Query primitives named `queryOperationName` (e.g., `queryGetUser`, `queryGetPosts`)
- Mutation action factories named `actionOperationName` (e.g., `actionCreateUser`, `actionUpdateUser`)
- Subscription helpers named `useSubscriptionOperationName` (e.g., `useSubscriptionOnUserUpdated`)
- Compatible with SolidStart's `createAsync` primitive for queries
- Mutation primitives return factory functions for component-level usage

### Design Decisions
- Generates both Query and Mutation primitives
- Subscriptions not generated (use `createSubscription` directly)
- Uses `@urql/solid-start` as the default import source
- Designed to work seamlessly with SolidStart's router `query` primitive via Provider
- Generates kebab-case cache keys for SolidStart's caching system (queries only)
- Mutation primitives return factory functions for component-level usage
