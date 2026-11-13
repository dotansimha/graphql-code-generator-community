import { buildSchema, parse } from 'graphql';
import { describe, expect, it } from 'vitest';
import type { Types } from '@graphql-codegen/plugin-helpers';
import { plugin } from '../src/index.js';

// A tiny schema; the plugin is document-driven and only prints operations, so
// the schema is not deeply inspected — but codegen/plugin signature wants one.
const schema = buildSchema(/* GraphQL */ `
  enum Role {
    ADMIN
    USER
  }

  type Friend {
    id: ID!
    name: String!
  }

  type User {
    id: ID!
    name: String!
    role: Role!
    friends: [Friend!]!
  }

  type Query {
    users(role: Role): [User!]!
  }

  type Mutation {
    createThing(name: String!): String!
  }
`);

/** Wrap operation SDL into the `DocumentFile[]` codegen expects. */
function docs(...sources: string[]): Types.DocumentFile[] {
  return sources.map((s, i) => ({
    location: `op${i}.graphql`,
    document: parse(s),
  }));
}

/** Run the plugin and return the combined prepend + content string. */
function run(...sources: string[]): string {
  const result = plugin(schema, docs(...sources), {}) as Types.ComplexPluginOutput;
  return [...(result.prepend ?? []), result.content].join('\n');
}

/** Run the plugin with an explicit config and return prepend + content. */
function runWithConfig(config: any, ...sources: string[]): string {
  const result = plugin(schema, docs(...sources), config) as Types.ComplexPluginOutput;
  return [...(result.prepend ?? []), result.content].join('\n');
}

describe('python-generic-sdk plugin', () => {
  it('emits the target example (document constant, Requester Protocol, get_sdk, method)', () => {
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

    // imports
    expect(out).toContain('from typing import Any, Optional, Protocol');

    // document constant + printed value (2-space indented graphql print)
    expect(out).toContain('GET_USERS_DOCUMENT = """query GetUsers($role: Role) {');
    expect(out).toContain(
      '  users(role: $role) {\n    id\n    name\n    role\n    friends {\n      id\n      name\n    }\n  }\n}"""',
    );

    // Requester Protocol (async by default)
    expect(out).toContain('class Requester(Protocol):');
    expect(out).toContain(
      "async def __call__(self, doc: str, variables: 'Any' = None, options: 'Any' = None) -> 'Any':",
    );

    // get_sdk factory + inner Sdk class
    expect(out).toContain('def get_sdk(requester: Requester):');
    expect(out).toContain('    class Sdk:');
    expect(out).toContain('    return Sdk()');

    // method: optional variables (Role is nullable) -> `Optional[...] = None`;
    // correct return type
    expect(out).toContain(
      "async def get_users(self, variables: 'Optional[GetUsersQueryVariables]' = None, options: 'Any' = None) -> 'GetUsersQuery':",
    );
    // The method awaits + hydrates the raw result into the operation result model
    // (pydantic `model_validate`, since wire keys arrive as aliases).
    expect(out).toContain(
      'return GetUsersQuery.model_validate(await requester(GET_USERS_DOCUMENT, variables, options))',
    );
  });

  it('names the result type with the Mutation suffix', () => {
    const out = run(/* GraphQL */ `
      mutation CreateThing($name: String!) {
        createThing(name: $name)
      }
    `);

    expect(out).toContain('CREATE_THING_DOCUMENT = """mutation CreateThing');
    expect(out).toContain("-> 'CreateThingMutation':");
    expect(out).toContain('async def create_thing(self,');
  });

  it('makes variables required (no `= None`) when a non-null variable has no default', () => {
    const out = run(/* GraphQL */ `
      query GetUsersRequired($role: Role!) {
        users(role: $role) {
          id
        }
      }
    `);

    expect(out).toContain(
      "async def get_users_required(self, variables: 'GetUsersRequiredQueryVariables', options: 'Any' = None) -> 'GetUsersRequiredQuery':",
    );
    // ensure it is NOT the optional form
    expect(out).not.toContain("variables: 'GetUsersRequiredQueryVariables' = None");
  });

  it('gives variables a `= None` default when the operation has no variables', () => {
    const out = run(/* GraphQL */ `
      query AllUsers {
        users {
          id
        }
      }
    `);

    expect(out).toContain(
      "async def all_users(self, variables: 'Optional[AllUsersQueryVariables]' = None, options: 'Any' = None) -> 'AllUsersQuery':",
    );
  });

  it('treats non-null variables WITH a default as optional (`= None`)', () => {
    const out = run(/* GraphQL */ `
      query GetUsersDefault($role: Role! = USER) {
        users(role: $role) {
          id
        }
      }
    `);

    expect(out).toContain(
      "async def get_users_default(self, variables: 'Optional[GetUsersDefaultQueryVariables]' = None, options: 'Any' = None) -> 'GetUsersDefaultQuery':",
    );
  });

  it('appends `_` to method names that collide with Python keywords', () => {
    const out = run(/* GraphQL */ `
      query Import {
        users {
          id
        }
      }
    `);

    expect(out).toContain(
      "async def import_(self, variables: 'Optional[ImportQueryVariables]' = None",
    );
    expect(out).toContain('IMPORT_DOCUMENT = """query Import');
  });

  it('throws a clear error for anonymous operations', () => {
    expect(() =>
      run(/* GraphQL */ `
        query {
          users {
            id
          }
        }
      `),
    ).toThrow(/requires every operation to be named/);
  });

  it('emits one method per operation and a single Requester/get_sdk', () => {
    const out = run(
      /* GraphQL */ `
        query GetUsers {
          users {
            id
          }
        }
      `,
      /* GraphQL */ `
        mutation CreateThing($name: String!) {
          createThing(name: $name)
        }
      `,
    );

    expect(out).toContain('async def get_users(self,');
    expect(out).toContain('async def create_thing(self,');
    // exactly one Requester protocol and one get_sdk
    expect(out.match(/class Requester\(Protocol\):/g)?.length).toBe(1);
    expect(out.match(/def get_sdk\(requester: Requester\):/g)?.length).toBe(1);
  });

  it('emits synchronous methods when asyncMethods is false', () => {
    const out = runWithConfig(
      { asyncMethods: false },
      /* GraphQL */ `
        query GetUsers($role: Role) {
          users(role: $role) {
            id
          }
        }
      `,
    );

    // synchronous Requester protocol + method (no `async`, no `await`)
    expect(out).toContain(
      "def __call__(self, doc: str, variables: 'Any' = None, options: 'Any' = None) -> 'Any':",
    );
    expect(out).not.toContain('async def __call__');
    expect(out).toContain(
      "def get_users(self, variables: 'Optional[GetUsersQueryVariables]' = None, options: 'Any' = None) -> 'GetUsersQuery':",
    );
    expect(out).not.toContain('async def get_users');
    expect(out).toContain(
      'return GetUsersQuery.model_validate(requester(GET_USERS_DOCUMENT, variables, options))',
    );
    expect(out).not.toContain('await requester');
  });

  it('matches python-operations casing for acronym operation names', () => {
    // change-case pascalCase lowercases acronym runs (GetHTTPStatus ->
    // GetHttpStatus), matching the class name @graphql-codegen/python-operations
    // emits, so the generated constructor call resolves.
    const out = run(/* GraphQL */ `
      query GetHTTPStatus {
        users {
          id
        }
      }
    `);
    expect(out).toContain("-> 'GetHttpStatusQuery':");
    expect(out).toContain('return GetHttpStatusQuery.model_validate(');
    expect(out).not.toContain('GetHTTPStatusQuery');
  });

  it('escapes double-quotes in the document constant so inline string args are safe', () => {
    const out = run(/* GraphQL */ `
      mutation M {
        createThing(name: "hi")
      }
    `);
    expect(out).toContain('createThing(name: \\"hi\\")');
    // the un-escaped form must not leak into the triple-quoted literal
    expect(out).not.toContain('createThing(name: "hi")');
  });

  it('matches the snapshot for the target example', () => {
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

  it('throws a clear error on a fragment spread instead of emitting a document missing the fragment definition', () => {
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

  describe('optional variables are typed Optional[...]', () => {
    it('wraps the annotation so `= None` type-checks', () => {
      const out = run(/* GraphQL */ `
        query GetUsers($role: Role) {
          users(role: $role) {
            id
          }
        }
      `);
      // A bare `variables: 'XVariables' = None` assigns None to a non-optional
      // TypedDict; pyright rejects it.
      expect(out).toContain("variables: 'Optional[GetUsersQueryVariables]' = None");
      expect(out).not.toContain("variables: 'GetUsersQueryVariables' = None");
    });

    it('leaves required variables unwrapped', () => {
      const out = run(/* GraphQL */ `
        mutation CreateThing($name: String!) {
          createThing(name: $name)
        }
      `);
      expect(out).toContain("variables: 'CreateThingMutationVariables'");
      expect(out).not.toContain('Optional[CreateThingMutationVariables]');
    });

    it('imports Optional so the annotation resolves', () => {
      const out = run(/* GraphQL */ `
        query GetUsers($role: Role) {
          users(role: $role) {
            id
          }
        }
      `);
      expect(out).toMatch(/from typing import .*\bOptional\b/);
    });
  });

  describe('Requester name collision with a schema type', () => {
    // The generated SDK shares a module with whatever @graphql-codegen/python
    // emitted for the schema, so a schema that defines `type Requester` would
    // otherwise have it shadowed by our Protocol.
    const schemaWithRequester = buildSchema(/* GraphQL */ `
      type Requester {
        uuid: Int!
      }
      type Query {
        requester: Requester
      }
    `);

    function runAgainst(schemaToUse: typeof schema, source: string): string {
      const result = plugin(schemaToUse, docs(source), {}) as Types.ComplexPluginOutput;
      return [...(result.prepend ?? []), result.content].join('\n');
    }

    const op = /* GraphQL */ `
      query GetRequester {
        requester {
          uuid
        }
      }
    `;

    it('suffixes the Protocol when the schema already claims the name', () => {
      const out = runAgainst(schemaWithRequester, op);
      expect(out).toContain('class Requester2(Protocol):');
      expect(out).toContain('def get_sdk(requester: Requester2):');
      // Must not redefine the schema's own type.
      expect(out).not.toContain('class Requester(Protocol):');
    });

    it('keeps the plain name when there is no collision', () => {
      const out = run(op.replace('requester {\n          uuid\n        }', 'users { id }'));
      expect(out).toContain('class Requester(Protocol):');
      expect(out).toContain('def get_sdk(requester: Requester):');
      expect(out).not.toContain('Requester2');
    });
  });

  it('throws a clear error on an inline fragment', () => {
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
