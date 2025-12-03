/**
 * Comprehensive Zod Schemas for API Response Validation
 *
 * These schemas provide runtime validation for API responses,
 * ensuring the API returns data in the expected format.
 */
import { z } from 'zod';

// ==================== Shared Schemas ====================

/**
 * Author schema - used in articles and comments
 */
export const AuthorSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  bio: z.string().nullable(),
  image: z.url('Invalid image URL').or(z.string()),
  following: z.boolean(),
});

/**
 * Profile schema
 */
export const ProfileSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  bio: z.string().nullable(),
  image: z.string(),
  following: z.boolean(),
});

// ==================== User Schemas ====================

/**
 * User schema - returned after login/register
 */
export const UserSchema = z.object({
  email: z.email('Invalid email format'),
  username: z.string().min(1, 'Username is required'),
  bio: z.string().nullable(),
  image: z.string().nullable(),
  token: z.string().min(1, 'Token is required'),
});

/**
 * User response wrapper
 */
export const UserResponseSchema = z.object({
  user: UserSchema,
});

/**
 * Profile response wrapper
 */
export const ProfileResponseSchema = z.object({
  profile: ProfileSchema,
});

// ==================== Article Schemas ====================

/**
 * Single article schema
 */
export const ArticleSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  body: z.string(),
  tagList: z.array(z.string()),
  createdAt: z.iso.datetime({ offset: true }).or(z.string()),
  updatedAt: z.iso.datetime({ offset: true }).or(z.string()),
  favorited: z.boolean(),
  favoritesCount: z.number().int().min(0),
  author: AuthorSchema,
});

/**
 * Single article response wrapper
 */
export const ArticleResponseSchema = z.object({
  article: ArticleSchema,
});

/**
 * Multiple articles response
 */
export const ArticlesResponseSchema = z.object({
  articles: z.array(ArticleSchema),
  articlesCount: z.number().int().min(0),
});

// ==================== Comment Schemas ====================

/**
 * Single comment schema
 */
export const CommentSchema = z.object({
  id: z.number().int().positive(),
  body: z.string(),
  createdAt: z.iso.datetime({ offset: true }).or(z.string()),
  updatedAt: z.iso.datetime({ offset: true }).or(z.string()),
  author: AuthorSchema,
});

/**
 * Single comment response wrapper
 */
export const CommentResponseSchema = z.object({
  comment: CommentSchema,
});

/**
 * Multiple comments response
 */
export const CommentsResponseSchema = z.object({
  comments: z.array(CommentSchema),
});

// ==================== Tags Schema ====================

/**
 * Tags response
 */
export const TagsResponseSchema = z.object({
  tags: z.array(z.string()),
});

// ==================== Error Schemas ====================

/**
 * Validation errors schema (422 responses)
 */
export const ValidationErrorsSchema = z.object({
  email: z.array(z.string()).optional(),
  username: z.array(z.string()).optional(),
  password: z.array(z.string()).optional(),
  title: z.array(z.string()).optional(),
  description: z.array(z.string()).optional(),
  body: z.array(z.string()).optional(),
  'email or password': z.array(z.string()).optional(),
});

/**
 * Error response wrapper
 */
export const ErrorResponseSchema = z.object({
  errors: ValidationErrorsSchema,
});

/**
 * Generic error schema (for 4xx/5xx errors)
 */
export const GenericErrorSchema = z.object({
  status: z.string(),
  error: z.string(),
});

// ==================== Request Payload Schemas ====================

/**
 * Login request payload
 */
export const LoginPayloadSchema = z.object({
  user: z.object({
    email: z.email(),
    password: z.string().min(1),
  }),
});

/**
 * Register request payload
 */
export const RegisterPayloadSchema = z.object({
  user: z.object({
    username: z.string().min(1),
    email: z.email(),
    password: z.string().min(8),
  }),
});

/**
 * Create article request payload
 */
export const CreateArticlePayloadSchema = z.object({
  article: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    body: z.string().min(1),
    tagList: z.array(z.string()).optional(),
  }),
});

/**
 * Update article request payload
 */
export const UpdateArticlePayloadSchema = z.object({
  article: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    body: z.string().optional(),
  }),
});

/**
 * Create comment request payload
 */
export const CreateCommentPayloadSchema = z.object({
  comment: z.object({
    body: z.string().min(1),
  }),
});

// ==================== Type Inference ====================

// Response types inferred from schemas
export type UserSchemaType = z.infer<typeof UserSchema>;
export type UserResponseSchemaType = z.infer<typeof UserResponseSchema>;
export type ProfileSchemaType = z.infer<typeof ProfileSchema>;
export type ProfileResponseSchemaType = z.infer<typeof ProfileResponseSchema>;
export type ArticleSchemaType = z.infer<typeof ArticleSchema>;
export type ArticleResponseSchemaType = z.infer<typeof ArticleResponseSchema>;
export type ArticlesResponseSchemaType = z.infer<typeof ArticlesResponseSchema>;
export type CommentSchemaType = z.infer<typeof CommentSchema>;
export type CommentResponseSchemaType = z.infer<typeof CommentResponseSchema>;
export type CommentsResponseSchemaType = z.infer<typeof CommentsResponseSchema>;
export type TagsResponseSchemaType = z.infer<typeof TagsResponseSchema>;
export type ErrorResponseSchemaType = z.infer<typeof ErrorResponseSchema>;
