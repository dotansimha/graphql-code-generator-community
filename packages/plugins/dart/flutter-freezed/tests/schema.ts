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
    ELSE
    else
    SWITCH
    switch
    FACTORY
    factory
  }
`);

export const baseSchema = buildSchema(/* GraphQL */ `
  type PersonType {
    id: String
    name: String!
  }
`);

export const extendedBaseSchema = buildSchema(/* GraphQL */ `
  type PersonType {
    id: String!
    name: String!
    status: String
  }

  input CreatePersonInput {
    name: String!
    status: String
  }

  input UpdatePersonInput {
    name: String
    status: String
  }

  input DeletePersonInput {
    id: String!
  }

  enum Episode {
    NEWHOPE
    EMPIRE
    JEDI
    VOID
    void
    IN
    in
    ELSE
    else
    SWITCH
    switch
    FACTORY
    factory
  }
`);

export const movieSchema = buildSchema(/* GraphQL */ `
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

export const starWarsSchema = buildSchema(/* GraphQL */ `
  enum Episode {
    NEWHOPE
    EMPIRE
    JEDI
    VOID
    void
    IN
    in
    ELSE
    else
    SWITCH
    switch
    FACTORY
    factory
    male
    female
    phoneNumber
  }

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

  type Starship {
    id: ID!
    name: String!
    length: Float
  }

  interface Character {
    id: ID!
    name: String!
    friends: [Character]
    appearsIn: [Episode]!
  }

  type MovieCharacter {
    name: String!
    appearsIn: [Episode]!
  }

  type Human implements Character {
    id: ID!
    name: String!
    friends: [MovieCharacter]
    appearsIn: [Episode]!
    starships: [Starship]
    totalCredits: Int
  }

  type Droid implements Character {
    id: ID!
    name: String!
    friends: [MovieCharacter]
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

export const simpleUnionSchema = buildSchema(/* GraphQL */ `
  input RequestOTPInput {
    email: String
    phoneNumber: String
  }

  input VerifyOTPInput {
    email: String
    phoneNumber: String
    otpCode: String!
  }

  union AuthWithOTPInput = RequestOTPInput | VerifyOTPInput
`);

export const nonNullableListWithCustomScalars = buildSchema(/* GraphQL */ `
  scalar UUID
  scalar timestamptz
  scalar jsonb

  type ComplexType {
    a: [String]
    b: [ID!]
    c: [Boolean!]!
    d: [[Int]]
    e: [[Float]!]
    f: [[String]!]!
    g: jsonb
    h: timestamptz!
    i: UUID!
  }
`);
