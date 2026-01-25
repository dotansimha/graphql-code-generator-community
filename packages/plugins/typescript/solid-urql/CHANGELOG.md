# Changelog

## [1.0.0] - 2026-01-12

### Added
- Initial release of GraphQL Code Generator plugin for SolidJS and URQL
- Support for generating typed `createQuery` wrappers
- Support for generating typed `createMutation` wrappers
- Support for generating typed `createSubscription` wrappers
- Configuration option `withPrimitives` to enable/disable primitive generation
- Configuration option `urqlImportFrom` to customize import source
- Full TypeScript support with proper type inference
- Comprehensive documentation and examples

### Features
- Generates wrapper functions around solid-urql primitives
- Proper handling of required vs optional variables
- Compatible with @urql/core and solid-urql
- Follows SolidJS conventions (uses `create*` naming instead of `use*`)
