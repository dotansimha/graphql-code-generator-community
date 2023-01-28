---
"@graphql-codegen/flutter-freezed": patch
---

docs(plugin config): :memo: updated plugin-config

added @type decorators, added missing TypeName and FieldName variables in the exampleMarkdowns

Breaking: mergeTypes signature changed to mergeTypes?: Record<string, TypeName[]>
Even though the key is a string, we recommend that you use the value of a TypeName.

Example: 
```ts filename='codegen.ts'
import type { CodegenConfig } from '@graphql-codegen/cli';

const Movie = TypeName.fromString('Movie');
const CreateMovieInput = TypeName.fromString('CreateMovieInput');
const UpdateMovieInput = TypeName.fromString('UpdateMovieInput');
const UpsertMovieInput = TypeName.fromString('UpsertMovieInput');

const config: CodegenConfig = {
generates: {
  'lib/data/models/app_models.dart': {
    plugins: {
      'flutter-freezed': {
       mergeTypes: {
         [Movie.value]: [CreateMovieInput, UpdateMovieInput, UpsertMovieInput],
       },
      },
    },
  },
},
};
export default config;
```
