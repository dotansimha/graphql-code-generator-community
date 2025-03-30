# @graphql-codegen/scala-resolvers

A GraphQL Code Generator plugin that generates Scala resolver interfaces for your GraphQL schema.

## Installation

```
yarn add -D @graphql-codegen/scala-resolvers
```

## Usage

```yaml
generates:
  src/main/scala/com/example/Resolvers.scala:
    plugins:
      - scala-resolvers
    config:
      packageName: com.example
      withFuture: true
```

## Configuration

The following are the available configuration options:

- `packageName`: Customize the Scala package name (default: generated from output file path)
- `classMembersPrefix`: Customize the class members prefix (default: empty)
- `enumValues`: Override enum values mapping (default: {})
- `generateCompanionObjects`: Generate companion objects for case classes (default: true)
- `useOptions`: Use Scala Option[T] for nullable fields (default: false)
- `className`: Customize the class name or object name (default: 'Resolvers')
- `listType`: Customize the list type (default: 'List')
- `useOpaqueTypes`: Use opaque types for certain types (default: false)
- `mappers`: Replace GraphQL types with custom model classes (default: {})
- `defaultMapper`: Default type for mappers if not specified (default: 'Any')
- `withFuture`: Include scala.concurrent.Future support for resolver methods (default: false)
- `withZIO`: Include ZIO support for resolver methods (default: false)

### Example Configuration

```yaml
generates:
  src/main/scala/com/example/Resolvers.scala:
    plugins:
      - scala-resolvers
    config:
      packageName: com.example
      withFuture: true
      withZIO: false
      mappers:
        User: com.example.models.UserModel
        Post: com.example.models.PostModel
      defaultMapper: com.example.models.BaseEntity
      listType: Vector
      useOptions: true
```

## Output Example

For a GraphQL schema with the following:

```graphql
type Query {
  user(id: ID!): User
  users: [User!]!
}

type User {
  id: ID!
  name: String!
  email: String!
}
```

This plugin will generate the following Scala code:

```scala
package com.example

import scala.concurrent.ExecutionContext
import scala.language.implicitConversions
import scala.concurrent.Future
import sangria.schema._

trait Resolvers {
  // This is needed to implement type class instances for resolvers
  given ExecutionContext = scala.concurrent.ExecutionContext.global

  trait QueryResolvers {
    // Resolver for user field
    def user(context: Context, value: Value): Future[String]

    // Resolver for users field
    def users(context: Context, value: Value): Future[List[User]]
  }

  trait UserResolvers {
    // Resolver for id field
    def id(context: Context, value: Value): Future[String]

    // Resolver for name field
    def name(context: Context, value: Value): Future[String]

    // Resolver for email field
    def email(context: Context, value: Value): Future[String]
  }
}
