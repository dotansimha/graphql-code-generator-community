from enum import Enum
from typing import Optional, TypedDict, Any
from pydantic import BaseModel, ConfigDict, Field
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