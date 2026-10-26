import { buildSchema } from 'graphql';
import { describe, expect, it } from 'vitest';
import type { PythonPluginConfig } from '../src/config.js';
import { plugin } from '../src/index.js';

const FULL_SCHEMA = /* GraphQL */ `
  scalar DateTime
  enum Role {
    ADMIN
    USER
  }
  interface Node {
    id: ID!
  }
  type User implements Node {
    id: ID!
    name: String!
    email: String
    role: Role!
    friends: [User!]!
    createdAt: DateTime
  }
  input UserFilter {
    role: Role
    from: String
  }
  type Query {
    users(filter: UserFilter): [User!]!
  }
`;

function run(schemaSDL: string, config: PythonPluginConfig = {}) {
  const schema = buildSchema(schemaSDL);
  const result = plugin(schema, [], config) as { prepend: string[]; content: string };
  return result;
}

function full(schemaSDL: string, config: PythonPluginConfig = {}): string {
  const { prepend, content } = run(schemaSDL, config);
  return `${prepend.join('\n')}\n\n\n${content}\n`;
}

describe('@graphql-codegen/python', () => {
  it('maps built-in scalars to native Python types and strips Optional on non-null', () => {
    const { content } = run(`
      type Q { a: ID! b: String! c: Int! d: Float! e: Boolean! }
    `);
    expect(content).toContain(`a: 'str'`);
    expect(content).toContain(`b: 'str'`);
    expect(content).toContain(`c: 'int'`);
    expect(content).toContain(`d: 'float'`);
    expect(content).toContain(`e: 'bool'`);
  });

  it('renders enums as (str, Enum) classes', () => {
    const { content, prepend } = run(`enum Role { ADMIN USER } type Q { r: Role! }`);
    expect(content).toContain('class Role(str, Enum):');
    expect(content).toContain(`    ADMIN = 'ADMIN'`);
    expect(content).toContain(`    USER = 'USER'`);
    expect(prepend).toContain('from enum import Enum');
  });

  it('renders object types as BaseModel classes', () => {
    const { content, prepend } = run(`type User { id: ID! name: String! }`);
    expect(content).toContain('class User(BaseModel):');
    expect(content).toContain(`    id: 'str'`);
    expect(content).toContain(`    name: 'str'`);
    expect(prepend).toContain('from pydantic import BaseModel');
  });

  it('renders interfaces as BaseModel classes', () => {
    const { content } = run(`interface Node { id: ID! }`);
    expect(content).toContain('class Node(BaseModel):');
    expect(content).toContain(`    id: 'str'`);
  });

  it('renders input types as TypedDict', () => {
    const { content, prepend } = run(`input UserFilter { role: String }`);
    expect(content).toContain('class UserFilter(TypedDict):');
    expect(prepend).toContain('from typing import Optional, TypedDict');
  });

  it('maps custom scalars to Any', () => {
    const { content, prepend } = run(`scalar DateTime type Q { at: DateTime }`);
    expect(content).toContain(`at: 'Optional[Any]'`);
    // no standalone class for the scalar
    expect(content).not.toContain('class DateTime');
    expect(prepend.some(l => l.includes('Any'))).toBe(true);
  });

  it('honors config.scalars overrides for custom scalars', () => {
    const { content } = run(`scalar DateTime type Q { at: DateTime! }`, {
      scalars: { DateTime: 'datetime' },
    });
    expect(content).toContain(`at: 'datetime'`);
  });

  it('converts object field names to snake_case by default (namingConvention: snakeCase)', () => {
    const { content } = run(`type User { createdAt: String firstName: String! }`);
    expect(content).toContain(`created_at: 'Optional[str]'`);
    expect(content).toContain(`first_name: 'str'`);
  });

  it('emits a functional TypedDict when an input key is a reserved keyword (inputs keep wire names)', () => {
    const { content, prepend } = run(`input F { from: String role: String }`);
    // `from` is a Python keyword -> whole input type uses functional syntax.
    expect(content).toContain(`F = TypedDict('F', {`);
    expect(content).toContain(`    'from': 'Optional[str]',`);
    expect(content).toContain(`    'role': 'Optional[str]',`);
    expect(content).not.toContain(`class F(TypedDict):`);
    expect(prepend).toContain('from typing import Optional, TypedDict');
  });

  it('keeps input keys as wire names (never snake-cased), class syntax when valid', () => {
    const { content } = run(`input UserFilter { role: String createdAt: String }`);
    expect(content).toContain(`class UserFilter(TypedDict):`);
    expect(content).toContain(`    role: 'Optional[str]'`);
    // Input keys keep the WIRE name (the runtime sends the dict as-is).
    expect(content).toContain(`    createdAt: 'Optional[str]'`);
    expect(content).not.toContain(`TypedDict('UserFilter'`);
  });

  it('input keys keep wire names even under namingConvention: snakeCase', () => {
    const { content } = run(`input F { from: String createdAt: String }`, {
      namingConvention: 'snakeCase',
    });
    expect(content).toContain(`F = TypedDict('F', {`);
    expect(content).toContain(`    'from': 'Optional[str]',`);
    expect(content).toContain(`    'createdAt': 'Optional[str]',`);
  });

  it('escapes keyword fields on object types and pins the wire key with Field(alias=...)', () => {
    // Object types extend a pydantic BaseModel; a keyword field is escaped with
    // `_` and `Field(alias=...)` pins the original wire key so pydantic hydrates
    // it onto the escaped attribute. `model_config` enables population by name.
    const { content, prepend } = run(
      `type Message { from: String! createdAt: String! class: Int }`,
    );
    expect(content).toContain(`class Message(BaseModel):`);
    expect(content).toContain(`    model_config = ConfigDict(populate_by_name=True)`);
    expect(content).toContain(`    from_: 'str' = Field(alias='from')`);
    expect(content).toContain(`    created_at: 'str' = Field(alias='createdAt')`);
    expect(content).toContain(`    class_: 'Optional[int]' = Field(default=None, alias='class')`);
    expect(content).not.toContain(`def __init__`);
    expect(prepend).toContain('from pydantic import BaseModel, ConfigDict, Field');
  });

  it('namingConvention: keep leaves object field names verbatim (keyword -> _ + alias)', () => {
    const { content } = run(`type User { createdAt: String firstName: String! from: String }`, {
      namingConvention: 'keep',
    });
    expect(content).toContain(`createdAt: 'Optional[str]' = None`);
    expect(content).toContain(`firstName: 'str'`);
    expect(content).toContain(`from_: 'Optional[str]' = Field(default=None, alias='from')`);
    expect(content).not.toContain(`def __init__`);
  });

  it('composes nullability and lists correctly', () => {
    const { content } = run(`
      type User { id: ID! }
      type Q {
        nn: String!
        opt: String
        reqList: [User!]!
        nullListNullItem: [User]
      }
    `);
    expect(content).toContain(`nn: 'str'`);
    expect(content).toContain(`opt: 'Optional[str]'`);
    expect(content).toContain(`req_list: 'list[User]'`);
    expect(content).toContain(`null_list_null_item: 'Optional[list[Optional[User]]]'`);
  });

  it('verifies onlyOperationTypes emits enums + inputs + scalars and skips object types', () => {
    const { content } = run(
      `scalar DateTime
       enum Role { ADMIN USER }
       input UserFilter { from: String role: Role }
       type Message { from: String! createdAt: DateTime! }
       type Query { m: Message }`,
      { onlyOperationTypes: true },
    );
    // enums + input types present...
    expect(content).toContain(`class Role(str, Enum):`);
    expect(content).toContain(`UserFilter = TypedDict('UserFilter', {`);
    // ...object types skipped.
    expect(content).not.toContain(`class Message`);
    expect(content).not.toContain(`class Query`);
    expect(content).not.toContain('BaseModel');
  });

  it('supports recursive types via quoted forward references', () => {
    const { content } = run(`type User { id: ID! friends: [User!]! }`);
    expect(content).toContain('class User(BaseModel):');
    expect(content).toContain(`friends: 'list[User]'`);
  });

  it('honors baseModel and runtimeImport config', () => {
    const { content, prepend } = run(`type User { id: ID! }`, {
      baseModel: 'PydModel',
      runtimeImport: 'myapp.models',
    });
    expect(content).toContain('class User(PydModel):');
    expect(prepend).toContain('from myapp.models import PydModel');
  });

  it('only emits imports that are actually used', () => {
    // No enum, no input, no Any -> only Optional + BaseModel
    const { prepend } = run(`type User { name: String }`);
    expect(prepend).not.toContain('from enum import Enum');
    expect(prepend).toContain('from typing import Optional');
    expect(prepend).toContain('from pydantic import BaseModel');
  });

  it('does not emit introspection types', () => {
    const { content } = run(FULL_SCHEMA);
    expect(content).not.toContain('__Schema');
    expect(content).not.toContain('__Type');
  });

  describe('unions', () => {
    const UNION_SCHEMA = /* GraphQL */ `
      type A {
        a: String
      }
      type B {
        b: Int
      }
      union AB = A | B
      type Query {
        thing: AB
      }
    `;

    it('emits a typing.Union alias with quoted members', () => {
      const { content, prepend } = run(UNION_SCHEMA);
      expect(content).toContain(`Ab = Union['A', 'B']`);
      expect(prepend.some(l => /from typing import .*\bUnion\b/.test(l))).toBe(true);
    });

    it('never emits TypeScript for a union', () => {
      // The inherited BaseTypesVisitor implementation emits `export type Ab = A | B;`
      // plus a `/** ... */` comment — neither is valid Python.
      const { content } = run(UNION_SCHEMA);
      expect(content).not.toContain('export type');
      expect(content).not.toContain('/**');
    });

    it('does not crash on a union without a description', () => {
      // The inherited implementation dereferences the description unguarded.
      expect(() => run(UNION_SCHEMA)).not.toThrow();
    });

    it('handles a documented union the same way', () => {
      const { content } = run(/* GraphQL */ `
        type A {
          a: String
        }
        type B {
          b: Int
        }
        "Documented."
        union AB = A | B
        type Query {
          thing: AB
        }
      `);
      expect(content).toContain(`Ab = Union['A', 'B']`);
      expect(content).not.toContain('export type');
    });

    it('is skipped under onlyOperationTypes / onlyEnums', () => {
      expect(run(UNION_SCHEMA, { onlyOperationTypes: true }).content).not.toContain('Ab = Union');
      expect(run(UNION_SCHEMA, { onlyEnums: true }).content).not.toContain('Ab = Union');
    });

    it('references the union from a field that selects it', () => {
      const { content } = run(UNION_SCHEMA);
      expect(content).toContain(`thing: 'Optional[Ab]'`);
    });
  });

  it('matches the full schema snapshot', () => {
    expect(full(FULL_SCHEMA)).toMatchSnapshot();
  });
});
