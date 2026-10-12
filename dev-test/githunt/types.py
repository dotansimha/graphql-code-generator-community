from enum import Enum
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
class Comment(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    content: 'str'
    created_at: 'float' = Field(alias='createdAt')
    id: 'int'
    posted_by: 'User' = Field(alias='postedBy')
    repo_name: 'str' = Field(alias='repoName')


class Entry(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    comment_count: 'int' = Field(alias='commentCount')
    comments: 'list[Optional[Comment]]'
    created_at: 'float' = Field(alias='createdAt')
    hot_score: 'float' = Field(alias='hotScore')
    id: 'int'
    posted_by: 'User' = Field(alias='postedBy')
    repository: 'Repository'
    score: 'int'
    vote: 'Vote'


class FeedType(str, Enum):
    HOT = 'HOT'
    NEW = 'NEW'
    TOP = 'TOP'


class Mutation(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    submit_comment: 'Optional[Comment]' = Field(default=None, alias='submitComment')
    submit_repository: 'Optional[Entry]' = Field(default=None, alias='submitRepository')
    vote: 'Optional[Entry]' = None


class Query(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    current_user: 'Optional[User]' = Field(default=None, alias='currentUser')
    entry: 'Optional[Entry]' = None
    feed: 'Optional[list[Optional[Entry]]]' = None


class Repository(BaseModel):
    description: 'Optional[str]' = None
    full_name: 'str'
    html_url: 'str'
    name: 'str'
    open_issues_count: 'Optional[int]' = None
    owner: 'Optional[User]' = None
    stargazers_count: 'int'


class Subscription(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    comment_added: 'Optional[Comment]' = Field(default=None, alias='commentAdded')


class User(BaseModel):
    avatar_url: 'str'
    html_url: 'str'
    login: 'str'


class Vote(BaseModel):
    vote_value: 'int'


class VoteType(str, Enum):
    CANCEL = 'CANCEL'
    DOWN = 'DOWN'
    UP = 'UP'