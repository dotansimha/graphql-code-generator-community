export const MAYBE_REGEX = /^Maybe<(.*?)>$/;
export const ARRAY_REGEX = /^Array<(.*?)>$/;
export const SCALAR_REGEX = /^Scalars\['(.*?)'\]$/;
export const GRAPHQL_TYPES = ['Query', 'Mutation', 'Subscription'];
export const NEST_SCALARS = ['ID', 'Int', 'Float', 'GraphQLISODateTime', 'GraphQLTimestamp'];
export const FIX_DECORATOR_SIGNATURE = `type FixDecorator<T> = T;`;
export const SCALARS = ['ID', 'String', 'Boolean', 'Int', 'Float'];
export const NEST_PREFIX = 'Nest';
export const NEST_IMPORT = `import * as ${NEST_PREFIX} from '@nestjs/graphql';\nexport { ${NEST_PREFIX} };`;
