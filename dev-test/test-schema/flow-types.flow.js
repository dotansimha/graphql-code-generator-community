// @flow

import { type GraphQLResolveInfo } from 'graphql';
export type $RequireFields<Origin, Keys> = $Diff<Origin, Keys> & $ObjMapi<Keys, <Key>(k: Key) => $NonMaybeType<$ElementType<Origin, Key>>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {|
  ID: { input: string, output: string, }
  String: { input: string, output: string, }
  Boolean: { input: boolean, output: boolean, }
  Int: { input: number, output: number, }
  Float: { input: number, output: number, }
|};

export type Query = {|
  __typename?: 'Query',
  allUsers: Array<?User>,
  userById?: ?User,
|};


export type QueryUserByIdArgs = {|
  id: $ElementType<$ElementType<Scalars, 'Int'>, 'input'>,
|};

export type User = {|
  __typename?: 'User',
  email: $ElementType<$ElementType<Scalars, 'String'>, 'output'>,
  id: $ElementType<$ElementType<Scalars, 'Int'>, 'output'>,
  name: $ElementType<$ElementType<Scalars, 'String'>, 'output'>,
|};

export type Resolver<Result, Parent = {}, Context = {}, Args = {}> = (
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo
) => Promise<Result> | Result;

export type SubscriptionSubscribeFn<Result, Parent, Context, Args> = (
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo
) => AsyncIterator<Result> | Promise<AsyncIterator<Result>>;

export type SubscriptionResolveFn<Result, Parent, Context, Args> = (
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo
) => Result | Promise<Result>;

export interface SubscriptionSubscriberObject<Result, Key: string, Parent, Context, Args> {
  subscribe: SubscriptionSubscribeFn<{ [key: Key]: Result }, Parent, Context, Args>;
  resolve?: SubscriptionResolveFn<Result, { [key: Key]: Result }, Context, Args>;
}

export interface SubscriptionResolverObject<Result, Parent, Context, Args> {
  subscribe: SubscriptionSubscribeFn<mixed, Parent, Context, Args>;
  resolve: SubscriptionResolveFn<Result, mixed, Context, Args>;
}

export type SubscriptionObject<Result, Key: string, Parent, Context, Args> =
  | SubscriptionSubscriberObject<Result, Key, Parent, Context, Args>
  | SubscriptionResolverObject<Result, Parent, Context, Args>;

export type SubscriptionResolver<Result, Key: string, Parent = {}, Context = {}, Args = {}> =
  | ((...args: Array<any>) => SubscriptionObject<Result, Key, Parent, Context, Args>)
  | SubscriptionObject<Result, Key, Parent, Context, Args>;

export type TypeResolveFn<Types, Parent = {}, Context = {}> = (
  parent: Parent,
  context: Context,
  info: GraphQLResolveInfo
) => ?Types | Promise<?Types>;

export type IsTypeOfResolverFn<T = {}, Context = {}> = (obj: T, context: Context, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<Result = {}, Parent = {}, Args = {}, Context = {}> = (
  next: NextResolverFn<Result>,
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo
) => Result | Promise<Result>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<$ElementType<$ElementType<Scalars, 'Boolean'>, 'output'>>,
  Int: ResolverTypeWrapper<$ElementType<$ElementType<Scalars, 'Int'>, 'output'>>,
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>,
  String: ResolverTypeWrapper<$ElementType<$ElementType<Scalars, 'String'>, 'output'>>,
  User: ResolverTypeWrapper<User>,
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: $ElementType<$ElementType<Scalars, 'Boolean'>, 'output'>,
  Int: $ElementType<$ElementType<Scalars, 'Int'>, 'output'>,
  Query: Record<PropertyKey, never>,
  String: $ElementType<$ElementType<Scalars, 'String'>, 'output'>,
  User: User,
};

export type QueryResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'Query'>> = {
  allUsers?: Resolver<Array<?$ElementType<ResolversTypes, 'User'>>, ParentType, ContextType>,
  userById?: Resolver<?$ElementType<ResolversTypes, 'User'>, ParentType, ContextType, $RequireFields<QueryUserByIdArgs, { id: * }>>,
};

export type UserResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'User'>> = {
  email?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, ContextType>,
  id?: Resolver<$ElementType<ResolversTypes, 'Int'>, ParentType, ContextType>,
  name?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, ContextType>,
};

export type Resolvers<ContextType = any> = {
  Query?: QueryResolvers<ContextType>,
  User?: UserResolvers<ContextType>,
};

