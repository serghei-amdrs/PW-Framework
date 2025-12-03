/**
 * Article API Client
 *
 * Provides type-safe methods for article-related API operations
 * with built-in schema validation and error handling.
 */

import { APIRequestContext } from '@playwright/test';
import { BaseApiClient, RequestOptions } from '../client/base-api-client';
import { NotFoundError } from '../errors';
import {
  ArticleResponseSchema,
  ArticlesResponseSchema,
  CommentResponseSchema,
  CommentsResponseSchema,
} from '../schemas/api-schemas';
import {
  Article,
  ArticleResponse,
  ArticlesResponse,
  Comment,
  CommentResponse,
  CommentsResponse,
  CreateArticlePayload,
  UpdateArticlePayload,
  CreateCommentPayload,
} from '../types';
import { API_ENDPOINTS } from '../../../test-data/constants';

/**
 * Query parameters for listing articles
 */
export interface ArticleQueryParams {
  /** Filter by tag */
  tag?: string;
  /** Filter by author username */
  author?: string;
  /** Filter by favorited username */
  favorited?: string;
  /** Number of articles to return (default: 20) */
  limit?: number;
  /** Number of articles to skip (default: 0) */
  offset?: number;
}

/**
 * Article API Client with full CRUD operations
 */
export class ArticleApiClient extends BaseApiClient {
  constructor(request: APIRequestContext, baseUrl: string, token?: string) {
    super(request, baseUrl, token);
  }

  // ==================== Article CRUD ====================

  /**
   * Create a new article
   */
  async createArticle(payload: CreateArticlePayload): Promise<Article> {
    const { data } = await this.postValidated<ArticleResponse>(
      `${API_ENDPOINTS.articles.base}/`,
      ArticleResponseSchema,
      'ArticleResponse',
      { body: payload as unknown as Record<string, unknown> }
    );
    return data.article;
  }

  /**
   * Get article by slug
   */
  async getArticle(slug: string): Promise<Article | null> {
    try {
      const { data } = await this.getValidated<ArticleResponse>(
        API_ENDPOINTS.articles.bySlug(slug),
        ArticleResponseSchema,
        'ArticleResponse'
      );
      return data.article;
    } catch (error) {
      // Return null for 404 instead of throwing
      if (error instanceof NotFoundError) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get article by slug (returns full response with status)
   */
  async getArticleResponse(slug: string): Promise<{ status: number; article: Article | null }> {
    const response = await this.get<ArticleResponse>(API_ENDPOINTS.articles.bySlug(slug), {
      failSilently: true,
    });

    if (response.status === 404) {
      return { status: 404, article: null };
    }

    const validated = this.validateResponse(
      response.body,
      ArticleResponseSchema,
      'ArticleResponse'
    );
    return { status: response.status, article: validated.article };
  }

  /**
   * Update an article
   */
  async updateArticle(slug: string, payload: UpdateArticlePayload): Promise<Article> {
    const { data } = await this.putValidated<ArticleResponse>(
      API_ENDPOINTS.articles.bySlug(slug),
      ArticleResponseSchema,
      'ArticleResponse',
      { body: payload as unknown as Record<string, unknown> }
    );
    return data.article;
  }

  /**
   * Delete an article
   */
  async deleteArticle(slug: string): Promise<boolean> {
    const response = await this.delete(API_ENDPOINTS.articles.bySlug(slug));
    return response.status === 204;
  }

  /**
   * Delete article if exists (silent failure)
   */
  async deleteArticleIfExists(slug: string): Promise<void> {
    await this.delete(API_ENDPOINTS.articles.bySlug(slug), { failSilently: true });
  }

  // ==================== Article Listing ====================

  /**
   * List articles with optional filters
   */
  async listArticles(params?: ArticleQueryParams): Promise<ArticlesResponse> {
    const { data } = await this.getValidated<ArticlesResponse>(
      API_ENDPOINTS.articles.base,
      ArticlesResponseSchema,
      'ArticlesResponse',
      { params: params as Record<string, string | number | boolean> }
    );
    return data;
  }

  /**
   * List articles from followed users (requires auth)
   */
  async listFeedArticles(
    params?: Pick<ArticleQueryParams, 'limit' | 'offset'>
  ): Promise<ArticlesResponse> {
    const { data } = await this.getValidated<ArticlesResponse>(
      `${API_ENDPOINTS.articles.base}/feed`,
      ArticlesResponseSchema,
      'ArticlesResponse',
      { params: params as Record<string, string | number | boolean> }
    );
    return data;
  }

  // ==================== Favorites ====================

  /**
   * Favorite an article
   */
  async favoriteArticle(slug: string): Promise<Article> {
    const { data } = await this.postValidated<ArticleResponse>(
      `${API_ENDPOINTS.articles.bySlug(slug)}/favorite`,
      ArticleResponseSchema,
      'ArticleResponse'
    );
    return data.article;
  }

  /**
   * Unfavorite an article
   */
  async unfavoriteArticle(slug: string): Promise<Article> {
    const response = await this.delete<ArticleResponse>(
      `${API_ENDPOINTS.articles.bySlug(slug)}/favorite`
    );
    const validated = this.validateResponse(
      response.body,
      ArticleResponseSchema,
      'ArticleResponse'
    );
    return validated.article;
  }

  // ==================== Comments ====================

  /**
   * Add comment to article
   */
  async addComment(slug: string, payload: CreateCommentPayload): Promise<Comment> {
    const { data } = await this.postValidated<CommentResponse>(
      `${API_ENDPOINTS.articles.bySlug(slug)}/comments`,
      CommentResponseSchema,
      'CommentResponse',
      { body: payload as unknown as Record<string, unknown> }
    );
    return data.comment;
  }

  /**
   * Get comments for article
   */
  async getComments(slug: string): Promise<Comment[]> {
    const { data } = await this.getValidated<CommentsResponse>(
      `${API_ENDPOINTS.articles.bySlug(slug)}/comments`,
      CommentsResponseSchema,
      'CommentsResponse'
    );
    return data.comments;
  }

  /**
   * Delete a comment
   */
  async deleteComment(slug: string, commentId: number): Promise<boolean> {
    const response = await this.delete(
      `${API_ENDPOINTS.articles.bySlug(slug)}/comments/${commentId}`
    );
    return response.status === 200 || response.status === 204;
  }
}
