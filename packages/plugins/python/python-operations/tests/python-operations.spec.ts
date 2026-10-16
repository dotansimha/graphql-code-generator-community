import { buildSchema, parse } from 'graphql';
import { describe, expect, it } from 'vitest';
import type { PythonOperationsPluginConfig } from '../src/config.js';
import { plugin } from '../src/index.js';

const SCHEMA = buildSchema(/* GraphQL */ `
  enum Role {
    ADMIN
    USER
  }

  type User {
    id: ID!
    name: String!
    role: Role!
    friends: [User!]!
  }

  input CreateUserInput {
    name: String!
    role: Role
  }

  type Query {
    users(role: Role): [User!]!
    me: User
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
  }

  type Message {
    id: ID!
    from: String!
    body: String!
  }

  type Feed {
    messages: [Message!]!
  }
`);

function run(op: string, config: PythonOperationsPluginConfig = {}): string {
  const documents = [{ location: 'test.graphql', document: parse(op) }];
  const result = plugin(SCHEMA, documents, config) as {
    prepend: string[];
    content: string;
  };
  return [...result.prepend, '', '', result.content].join('\n');
}

describe('python-operations plugin', () => {
  it('emits the target example: nested named BaseModel classes + variables TypedDict (deepest first)', () => {
    const out = run(/* GraphQL */ `
      query GetUsers($role: Role) {
        users(role: $role) {
          id
          name
          role
          friends {
            id
            name
          }
        }
      }
    `);

    expect(out).toContain('from typing import Optional, TypedDict');
    expect(out).toContain('from pydantic import BaseModel');

    expect(out).toContain(
      [`class GetUsersQueryUsersFriends(BaseModel):`, `    id: 'str'`, `    name: 'str'`].join(
        '\n',
      ),
    );

    expect(out).toContain(
      [
        `class GetUsersQueryUsers(BaseModel):`,
        `    id: 'str'`,
        `    name: 'str'`,
        `    role: 'Role'`,
        `    friends: 'list[GetUsersQueryUsersFriends]'`,
      ].join('\n'),
    );

    expect(out).toContain(
      [`class GetUsersQuery(BaseModel):`, `    users: 'list[GetUsersQueryUsers]'`].join('\n'),
    );

    // Variables are a TypedDict keyed by the WIRE variable name.
    expect(out).toContain(
      [`class GetUsersQueryVariables(TypedDict):`, `    role: 'Optional[Role]'`].join('\n'),
    );

    // Deepest type must appear before its parent.
    expect(out.indexOf('class GetUsersQueryUsersFriends')).toBeLessThan(
      out.indexOf('class GetUsersQueryUsers('),
    );
    expect(out.indexOf('class GetUsersQueryUsers(')).toBeLessThan(
      out.indexOf('class GetUsersQuery('),
    );
  });

  it('handles mutations with input-object variables', () => {
    const out = run(/* GraphQL */ `
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          name
        }
      }
    `);

    expect(out).toContain(
      [`class CreateUserMutationCreateUser(BaseModel):`, `    id: 'str'`, `    name: 'str'`].join(
        '\n',
      ),
    );
    // Response key `createUser` -> snake_case attribute `create_user`, pinned to
    // the wire key with `Field(alias=...)` (+ model_config for populate_by_name).
    expect(out).toContain(
      [
        `class CreateUserMutation(BaseModel):`,
        `    model_config = ConfigDict(populate_by_name=True)`,
        `    create_user: 'CreateUserMutationCreateUser' = Field(alias='createUser')`,
      ].join('\n'),
    );
    // Variables keep the WIRE name `input`.
    expect(out).toContain(
      [`class CreateUserMutationVariables(TypedDict):`, `    input: 'CreateUserInput'`].join('\n'),
    );
  });

  it('supports field aliases (alias is the response key) and snake_cases them', () => {
    const out = run(/* GraphQL */ `
      query Aliased {
        currentUser: me {
          fullName: name
        }
      }
    `);

    // Nested type name is derived from the alias (PascalCase).
    expect(out).toContain(`class AliasedQueryCurrentUser(BaseModel):`);
    // Response keys are snake_cased by default.
    expect(out).toContain(`    full_name: 'str'`);
    expect(out).toContain(`    current_user: 'Optional[AliasedQueryCurrentUser]'`);
  });

  it('supports __typename selections (emitted as typename__ with Field(alias="__typename"))', () => {
    const out = run(/* GraphQL */ `
      query WithTypename {
        me {
          __typename
          id
        }
      }
    `);

    expect(out).toContain('from typing import Optional, TypedDict, Literal');
    // pydantic forbids a leading-underscore field name, so `__typename` maps to
    // `typename__` pinned with an alias.
    expect(out).toContain(`    typename__: 'Literal["User"]' = Field(alias='__typename')`);
  });

  const MESSAGE_SCHEMA = buildSchema(/* GraphQL */ `
    type Message {
      id: ID!
      from: String!
      body: String!
    }
    type Query {
      message: Message
    }
  `);
  const GET_MESSAGE_OP = /* GraphQL */ `
    query GetMessage {
      message {
        id
        from
        body
      }
    }
  `;

  it('escapes the reserved key "from" to from_ and pins it with Field(alias="from") (default snakeCase)', () => {
    const documents = [{ location: 'test.graphql', document: parse(GET_MESSAGE_OP) }];
    const result = plugin(MESSAGE_SCHEMA, documents, {}) as {
      prepend: string[];
      content: string;
    };
    const out = [...result.prepend, '', '', result.content].join('\n');

    // Result types are BaseModel classes -> `from` becomes `from_` + alias.
    expect(out).toContain(`class GetMessageQueryMessage(BaseModel):`);
    expect(out).toContain(`    from_: 'str' = Field(alias='from')`);
    expect(out).not.toContain(`def __init__`);
    expect(out).not.toContain(`TypedDict('GetMessageQueryMessage'`);
  });

  it('namingConvention: keep still escapes the reserved key "from" to from_ (BaseModel class)', () => {
    const documents = [{ location: 'test.graphql', document: parse(GET_MESSAGE_OP) }];
    const result = plugin(MESSAGE_SCHEMA, documents, {
      namingConvention: 'keep',
    }) as { prepend: string[]; content: string };
    const out = [...result.prepend, '', '', result.content].join('\n');

    expect(out).toContain(`class GetMessageQueryMessage(BaseModel):`);
    expect(out).toContain(`    from_: 'str' = Field(alias='from')`);
    expect(out).not.toContain(`def __init__`);
  });

  it('namingConvention: keep leaves non-keyword response keys verbatim', () => {
    const out = run(
      /* GraphQL */ `
        query Aliased {
          currentUser: me {
            fullName: name
          }
        }
      `,
      { namingConvention: 'keep' },
    );
    expect(out).toContain(`    fullName: 'str'`);
    expect(out).toContain(`    currentUser: 'Optional[AliasedQueryCurrentUser]'`);
  });

  it('emits an empty (pass) variables TypedDict when there are no variables', () => {
    const out = run(/* GraphQL */ `
      query NoVars {
        me {
          id
        }
      }
    `);

    expect(out).toContain([`class NoVarsQueryVariables(TypedDict):`, `    pass`].join('\n'));
  });

  it('handles nested lists and nullability in variables + fields', () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        matrix(rows: [[Int]], tags: [String!]): [[Int!]]
      }
    `);
    const documents = [
      {
        location: 'test.graphql',
        document: parse(/* GraphQL */ `
          query Grid($rows: [[Int]], $tags: [String!]) {
            matrix(rows: $rows, tags: $tags)
          }
        `),
      },
    ];
    const result = plugin(schema, documents, {}) as { prepend: string[]; content: string };
    const out = [...result.prepend, '', '', result.content].join('\n');

    // field: [[Int!]]  -> Optional[list[Optional[list[int]]]]
    expect(out).toContain(`    matrix: 'Optional[list[Optional[list[int]]]]'`);
    // var rows: [[Int]] -> Optional[list[Optional[list[Optional[int]]]]]
    expect(out).toContain(`    rows: 'Optional[list[Optional[list[Optional[int]]]]]'`);
    // var tags: [String!] -> Optional[list[str]]
    expect(out).toContain(`    tags: 'Optional[list[str]]'`);
  });

  it('emits Any for custom scalars', () => {
    const schema = buildSchema(/* GraphQL */ `
      scalar DateTime
      type Event {
        id: ID!
        at: DateTime!
      }
      type Query {
        event: Event
      }
    `);
    const documents = [
      {
        location: 'test.graphql',
        document: parse(/* GraphQL */ `
          query GetEvent {
            event {
              id
              at
            }
          }
        `),
      },
    ];
    const result = plugin(schema, documents, {}) as { prepend: string[]; content: string };
    const out = [...result.prepend, '', '', result.content].join('\n');

    expect(out).toContain(`from typing import Optional, TypedDict, Any`);
    expect(out).toContain(`    at: 'Any'`);
  });

  it('prepends a star import when typesImport is set', () => {
    const out = run(
      /* GraphQL */ `
        query GetUsers($role: Role) {
          users(role: $role) {
            id
          }
        }
      `,
      { typesImport: 'my_pkg.schema_types' },
    );
    expect(out).toContain('from my_pkg.schema_types import *');
  });

  it('honors baseModel and runtimeImport config', () => {
    const out = run(
      /* GraphQL */ `
        query GetUsers {
          users {
            id
          }
        }
      `,
      { baseModel: 'PydModel', runtimeImport: 'myapp.models' },
    );
    expect(out).toContain('class GetUsersQueryUsers(PydModel):');
    expect(out).toContain('from myapp.models import PydModel');
  });

  it('matches the full snapshot for the target example', () => {
    const out = run(/* GraphQL */ `
      query GetUsers($role: Role) {
        users(role: $role) {
          id
          name
          role
          friends {
            id
            name
          }
        }
      }
    `);
    expect(out).toMatchSnapshot();
  });

  it('throws a clear error on a fragment spread instead of silently omitting its fields', () => {
    expect(() =>
      run(/* GraphQL */ `
        fragment UserFields on User {
          id
          name
        }
        query GetUsers {
          users {
            ...UserFields
          }
        }
      `),
    ).toThrow(/fragment spread "...UserFields"/);
  });

  it('throws a clear error on an inline fragment instead of silently omitting its fields', () => {
    expect(() =>
      run(/* GraphQL */ `
        query GetUsers {
          users {
            ... on User {
              id
              name
            }
          }
        }
      `),
    ).toThrow(/inline fragment "... on User"/);
  });
});
