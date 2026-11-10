---
'@graphql-codegen/python-generic-sdk': minor
---

Add `@graphql-codegen/python-generic-sdk`, the Python counterpart of `typescript-generic-sdk`.

For each named operation it emits a `<NAME>_DOCUMENT` constant, a `Requester` protocol and a
`get_sdk(requester)` factory with one typed method per operation that returns the
`@graphql-codegen/python-operations` result model. Use it after the `python` and
`python-operations` plugins in the same output file. Set `asyncMethods: false` for synchronous
methods.
