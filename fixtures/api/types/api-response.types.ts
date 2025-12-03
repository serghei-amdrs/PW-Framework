/**
 * Comprehensive API Response Types
 *
 * These types represent all possible API responses from the Conduit API.
 * They are used for type safety in tests and service classes.
 */

// ==================== Author & Profile ====================

export interface Author {
  username: string;
  bio: string | null;
  image: string;
  following: boolean;
}

export interface Profile {
  username: string;
  bio: string | null;
  image: string;
  following: boolean;
}

export interface ProfileResponse {
  profile: Profile;
}

// ==================== User ====================

export interface User {
  email: string;
  username: string;
  bio: string | null;
  image: string | null;
  token: string;
}

export interface UserResponse {
  user: User;
}

// ==================== Article ====================

export interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: Author;
}

export interface ArticleResponse {
  article: Article;
}

export interface ArticlesResponse {
  articles: Article[];
  articlesCount: number;
}

// ==================== Comment ====================

export interface Comment {
  id: number;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
}

export interface CommentResponse {
  comment: Comment;
}

export interface CommentsResponse {
  comments: Comment[];
}

// ==================== Tags ====================

export interface TagsResponse {
  tags: string[];
}

// ==================== Errors ====================

export interface ValidationErrors {
  email?: string[];
  username?: string[];
  password?: string[];
  title?: string[];
  description?: string[];
  body?: string[];
  'email or password'?: string[];
}

export interface ErrorResponse {
  errors: ValidationErrors;
}

export interface GenericError {
  status: string;
  error: string;
}

// ==================== Request Payloads ====================

export interface LoginPayload {
  user: {
    email: string;
    password: string;
  };
}

export interface RegisterPayload {
  user: {
    username: string;
    email: string;
    password: string;
  };
}

export interface UpdateUserPayload {
  user: {
    email?: string;
    username?: string;
    password?: string;
    image?: string;
    bio?: string;
  };
}

export interface CreateArticlePayload {
  article: {
    title: string;
    description: string;
    body: string;
    tagList?: string[];
  };
}

export interface UpdateArticlePayload {
  article: {
    title?: string;
    description?: string;
    body?: string;
  };
}

export interface CreateCommentPayload {
  comment: {
    body: string;
  };
}

// ==================== API Response Wrapper ====================

export interface ApiResponse<T> {
  status: number;
  body: T;
  headers?: Record<string, string>;
}

export type ApiResult<T> =
  | { success: true; data: T; status: number }
  | { success: false; error: ErrorResponse | GenericError; status: number };
