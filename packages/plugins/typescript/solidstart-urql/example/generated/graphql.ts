import { createQuery, createMutation } from '@urql/solid-start';
import { createSubscription, type CreateQueryArgs } from '@urql/solid';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Mutation = {
  __typename?: 'Mutation';
  createUser: User;
  deleteUser: Scalars['Boolean']['output'];
  updateUser: User;
};


export type MutationCreateUserArgs = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateUserArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type Post = {
  __typename?: 'Post';
  author: User;
  content: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  post?: Maybe<Post>;
  posts: Array<Post>;
  user?: Maybe<User>;
  users: Array<User>;
};


export type QueryPostArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  postAdded: Post;
  userAdded: User;
  userUpdated: User;
};


export type SubscriptionUserUpdatedArgs = {
  userId: Scalars['ID']['input'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  posts: Array<Post>;
};

export type GetUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUsersQuery = { __typename?: 'Query', users: Array<{ __typename?: 'User', id: string, name: string, email: string }> };

export type GetUserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetUserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, name: string, email: string, posts: Array<{ __typename?: 'Post', id: string, title: string, createdAt: string }> } | null };

export type GetPostsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPostsQuery = { __typename?: 'Query', posts: Array<{ __typename?: 'Post', id: string, title: string, content: string, createdAt: string, author: { __typename?: 'User', id: string, name: string } }> };

export type GetPostQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetPostQuery = { __typename?: 'Query', post?: { __typename?: 'Post', id: string, title: string, content: string, createdAt: string, author: { __typename?: 'User', id: string, name: string, email: string } } | null };

export type CreateUserMutationVariables = Exact<{
  name: Scalars['String']['input'];
  email: Scalars['String']['input'];
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'User', id: string, name: string, email: string } };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'User', id: string, name: string, email: string } };

export type OnUserAddedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OnUserAddedSubscription = { __typename?: 'Subscription', userAdded: { __typename?: 'User', id: string, name: string, email: string } };

export type OnPostAddedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OnPostAddedSubscription = { __typename?: 'Subscription', postAdded: { __typename?: 'Post', id: string, title: string, content: string, author: { __typename?: 'User', id: string, name: string } } };

export type OnUserUpdatedSubscriptionVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type OnUserUpdatedSubscription = { __typename?: 'Subscription', userUpdated: { __typename?: 'User', id: string, name: string, email: string, posts: Array<{ __typename?: 'Post', id: string, title: string }> } };


export const GetUsersDocument = new TypedDocumentString(`
    query GetUsers {
  users {
    id
    name
    email
  }
}
    `);

export const queryGetUsers = createQuery<GetUsersQuery, GetUsersQueryVariables>(
  GetUsersDocument,
  'get-users'
);

export const GetUserDocument = new TypedDocumentString(`
    query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    posts {
      id
      title
      createdAt
    }
  }
}
    `);

export const queryGetUser = createQuery<GetUserQuery, GetUserQueryVariables>(
  GetUserDocument,
  'get-user'
);

export const GetPostsDocument = new TypedDocumentString(`
    query GetPosts {
  posts {
    id
    title
    content
    createdAt
    author {
      id
      name
    }
  }
}
    `);

export const queryGetPosts = createQuery<GetPostsQuery, GetPostsQueryVariables>(
  GetPostsDocument,
  'get-posts'
);

export const GetPostDocument = new TypedDocumentString(`
    query GetPost($id: ID!) {
  post(id: $id) {
    id
    title
    content
    createdAt
    author {
      id
      name
      email
    }
  }
}
    `);

export const queryGetPost = createQuery<GetPostQuery, GetPostQueryVariables>(
  GetPostDocument,
  'get-post'
);

export const CreateUserDocument = new TypedDocumentString(`
    mutation CreateUser($name: String!, $email: String!) {
  createUser(name: $name, email: $email) {
    id
    name
    email
  }
}
    `);

export const actionCreateUser = () => createMutation<CreateUserMutation, CreateUserMutationVariables>(
  CreateUserDocument,
  'create-user'
);

export const UpdateUserDocument = new TypedDocumentString(`
    mutation UpdateUser($id: ID!, $name: String, $email: String) {
  updateUser(id: $id, name: $name, email: $email) {
    id
    name
    email
  }
}
    `);

export const actionUpdateUser = () => createMutation<UpdateUserMutation, UpdateUserMutationVariables>(
  UpdateUserDocument,
  'update-user'
);

export const OnUserAddedDocument = new TypedDocumentString(`
    subscription OnUserAdded {
  userAdded {
    id
    name
    email
  }
}
    `);

export const useSubscriptionOnUserAdded = (args: Omit<CreateQueryArgs<OnUserAddedSubscriptionVariables, OnUserAddedSubscription>, 'query'> = {}) => {
  return createSubscription<OnUserAddedSubscription, OnUserAddedSubscriptionVariables>({
    ...args,
    query: OnUserAddedDocument,
  });
};

export const OnPostAddedDocument = new TypedDocumentString(`
    subscription OnPostAdded {
  postAdded {
    id
    title
    content
    author {
      id
      name
    }
  }
}
    `);

export const useSubscriptionOnPostAdded = (args: Omit<CreateQueryArgs<OnPostAddedSubscriptionVariables, OnPostAddedSubscription>, 'query'> = {}) => {
  return createSubscription<OnPostAddedSubscription, OnPostAddedSubscriptionVariables>({
    ...args,
    query: OnPostAddedDocument,
  });
};

export const OnUserUpdatedDocument = new TypedDocumentString(`
    subscription OnUserUpdated($userId: ID!) {
  userUpdated(userId: $userId) {
    id
    name
    email
    posts {
      id
      title
    }
  }
}
    `);

export const useSubscriptionOnUserUpdated = (args: Omit<CreateQueryArgs<OnUserUpdatedSubscriptionVariables, OnUserUpdatedSubscription>, 'query'>) => {
  return createSubscription<OnUserUpdatedSubscription, OnUserUpdatedSubscriptionVariables>({
    ...args,
    query: OnUserUpdatedDocument,
  });
};
