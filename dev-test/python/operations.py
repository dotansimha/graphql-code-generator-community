from enum import Enum
from typing import Optional, TypedDict, Any
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, TypedDict
class CreateUserInput(TypedDict):
    name: 'str'
    role: 'Optional[Role]'


class Mutation(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    create_user: 'User' = Field(alias='createUser')


class Node(BaseModel):
    id: 'str'


class Query(BaseModel):
    me: 'Optional[User]' = None
    users: 'list[User]'


class Role(str, Enum):
    ADMIN = 'ADMIN'
    USER = 'USER'


class User(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    created_at: 'Optional[Any]' = Field(default=None, alias='createdAt')
    email: 'Optional[str]' = None
    friends: 'list[User]'
    id: 'str'
    name: 'str'
    role: 'Role'
class GetUsersQueryUsersFriends(BaseModel):
    id: 'str'
    name: 'str'


class GetUsersQueryUsers(BaseModel):
    id: 'str'
    name: 'str'
    role: 'Role'
    friends: 'list[GetUsersQueryUsersFriends]'


class GetUsersQuery(BaseModel):
    users: 'list[GetUsersQueryUsers]'


class GetUsersQueryVariables(TypedDict):
    role: 'Optional[Role]'


class CreateUserMutationCreateUser(BaseModel):
    id: 'str'
    name: 'str'
    role: 'Role'


class CreateUserMutation(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    create_user: 'CreateUserMutationCreateUser' = Field(alias='createUser')


class CreateUserMutationVariables(TypedDict):
    input: 'CreateUserInput'