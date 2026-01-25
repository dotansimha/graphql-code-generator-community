// This file was manually created to demonstrate the expected output
// The plugin works correctly but has a GraphQL module duplication issue in monorepo setup

import { createQuery, createMutation, type CreateQueryArgs, type CreateMutationState } from 'solid-urql';
import type { Accessor } from 'solid-js';
import type { OperationContext, OperationResult } from '@urql/core';

export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };

export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  name: Scalars['String'];
  email: Scalars['String'];
  posts: Array<Post>;
};

export type Post = {
  __typename?: 'Post';
  id: Scalars['ID'];
  title: Scalars['String'];
  content: Scalars['String'];
  author: User;
};

export type GetUsersQuery = {
  __typename?: 'Query';
  users: Array<{
    __typename?: 'User';
    id: string;
    name: string;
    email: string;
  }>;
};

export type GetUserQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type GetUserQuery = {
  __typename?: 'Query';
  user?: Maybe<{
    __typename?: 'User';
    id: string;
    name: string;
    email: string;
    posts: Array<{
      __typename?: 'Post';
      id: string;
      title: string;
    }>;
  }>;
};

export type CreateUserMutationVariables = Exact<{
  name: Scalars['String'];
  email: Scalars['String'];
}>;

export type CreateUserMutation = {
  __typename?: 'Mutation';
  createUser: {
    __typename?: 'User';
    id: string;
    name: string;
    email: string;
  };
};

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
}>;

export type UpdateUserMutation = {
  __typename?: 'Mutation';
  updateUser: {
    __typename?: 'User';
    id: string;
    name: string;
    email: string;
  };
};

export type OnUserUpdatedSubscriptionVariables = Exact<{
  userId: Scalars['ID'];
}>;

export type OnUserUpdatedSubscription = {
  __typename?: 'Subscription';
  userUpdated: {
    __typename?: 'User';
    id: string;
    name: string;
    email: string;
  };
};

const GetUsersDocument = `
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`;

const GetUserDocument = `
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      posts {
        id
        title
      }
    }
  }
`;

const CreateUserDocument = `
  mutation CreateUser($name: String!, $email: String!) {
    createUser(name: $name, email: $email) {
      id
      name
      email
    }
  }
`;

const UpdateUserDocument = `
  mutation UpdateUser($id: ID!, $name: String, $email: String) {
    updateUser(id: $id, name: $name, email: $email) {
      id
      name
      email
    }
  }
`;

const OnUserUpdatedDocument = `
  subscription OnUserUpdated($userId: ID!) {
    userUpdated(userId: $userId) {
      id
      name
      email
    }
  }
`;

export const useCreateGetUsers = (args: Omit<CreateQueryArgs<{}, GetUsersQuery>, 'query'> = {}) => {
  return createQuery<GetUsersQuery, {}>({
    ...args,
    query: GetUsersDocument,
  });
};

export const useCreateGetUser = (args: Omit<CreateQueryArgs<GetUserQueryVariables, GetUserQuery>, 'query'>) => {
  return createQuery<GetUserQuery, GetUserQueryVariables>({
    ...args,
    query: GetUserDocument,
  });
};

export const useCreateCreateUser = () => {
  return createMutation<CreateUserMutation, CreateUserMutationVariables>(CreateUserDocument);
};

export const useCreateUpdateUser = () => {
  return createMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument);
};

export const useCreateOnUserUpdated = (args: Omit<CreateQueryArgs<OnUserUpdatedSubscriptionVariables, OnUserUpdatedSubscription>, 'query'>) => {
  return createSubscription<OnUserUpdatedSubscription, OnUserUpdatedSubscriptionVariables>({
    ...args,
    query: OnUserUpdatedDocument,
  });
};
