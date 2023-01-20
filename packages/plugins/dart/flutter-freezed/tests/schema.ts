import { buildSchema } from 'graphql';

export const enumSchema = buildSchema(/* GraphQL */ `
  enum Episode {
    NEWHOPE
    EMPIRE
    JEDI
    VOID
    void
    IN
    in
    String
    ELSE
    else
    SWITCH
    switch
    FACTORY
    factory
  }
`);

export const simpleSchema = buildSchema(/* GraphQL */ `
  type Person {
    id: String
    name: String!
  }
`);

export const mergeSchema = buildSchema(/* GraphQL */ `
  type Movie {
    id: ID!
    title: String!
  }

  input CreateMovieInput {
    title: String!
  }

  input UpsertMovieInput {
    id: ID!
    title: String!
  }

  input UpdateMovieInput {
    id: ID!
    title: String
  }

  input DeleteMovieInput {
    id: ID!
  }
`);

export const unionSchema = buildSchema(/* GraphQL */ `
  enum Episode {
    NEWHOPE
    EMPIRE
    JEDI
  }

  type Actor {
    name: String!
    appearsIn: [Episode]!
  }

  type Starship {
    id: ID!
    name: String! #@constraint(minLength: 5, maxLength: 10)
    length: Float
  }

  interface Character {
    id: ID!
    name: String!
    friends: [Character]
    appearsIn: [Episode]!
  }

  type Human implements Character {
    id: ID!
    name: String!
    friends: [Actor]
    appearsIn: [Episode]!
    totalCredits: Int
  }

  type Droid implements Character {
    id: ID!
    name: String!
    friends: [Actor]
    appearsIn: [Episode]!
    primaryFunction: String
  }

  union SearchResult = Human | Droid | Starship
`);

export const cyclicSchema = buildSchema(/* GraphQL */ `
  input BaseAInput {
    b: BaseBInput!
  }

  input BaseBInput {
    c: BaseCInput!
  }

  input BaseCInput {
    a: BaseAInput!
  }

  type Base {
    id: String
  }
`);

export const escapedSchema = buildSchema(/* GraphQL */ `
  input Enum {
    is: String
    in: String
  }

  input List {
    map: String
    implements: String
    extends: String!
  }

  union Object = Enum | List
`);

export const nonNullableListWithCustomScalars = buildSchema(/* GraphQL */ `
  scalar UUID
  scalar timestamp
  scalar jsonb

  type ComplexType {
    a: [String]
    b: [ID!]
    c: [Boolean!]!
    d: [[Int]]
    e: [[Float]!]
    f: [[String]!]!
    g: jsonb
    h: timestamp!
    i: UUID!
  }
`);
