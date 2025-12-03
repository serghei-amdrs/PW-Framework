import { APIRequestContext } from '@playwright/test';
import { ArticlePayload, ArticleData } from '../../../test-data/types';
import { API_ENDPOINTS, HTTP_STATUS } from '../../../test-data/constants';

/**
 * API Service for article-related operations.
 * Used for test setup, teardown, and direct API testing.
 */
export class ArticleApiService {
  constructor(
    private request: APIRequestContext,
    private baseUrl: string,
    private token?: string
  ) {}

  private get headers(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }
    return headers;
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Create a new article
   */
  async createArticle(
    articleData: ArticlePayload
  ): Promise<{ slug: string; article: ArticleData }> {
    const response = await this.request.post(`${this.baseUrl}${API_ENDPOINTS.articles.base}/`, {
      headers: this.headers,
      data: articleData,
    });

    if (response.status() !== HTTP_STATUS.CREATED) {
      throw new Error(`Failed to create article: ${response.status()} - ${await response.text()}`);
    }

    const body = (await response.json()) as { article: ArticleData & { slug: string } };
    return {
      slug: body.article.slug,
      article: body.article,
    };
  }

  /**
   * Get article by slug
   */
  async getArticle(slug: string): Promise<ArticleData | null> {
    const response = await this.request.get(
      `${this.baseUrl}${API_ENDPOINTS.articles.bySlug(slug)}`,
      { headers: this.headers }
    );

    if (response.status() === HTTP_STATUS.NOT_FOUND) {
      return null;
    }

    if (response.status() !== HTTP_STATUS.OK) {
      throw new Error(`Failed to get article: ${response.status()}`);
    }

    const body = (await response.json()) as { article: ArticleData };
    return body.article;
  }

  /**
   * Update an article
   */
  async updateArticle(
    slug: string,
    articleData: ArticlePayload
  ): Promise<{ slug: string; article: ArticleData }> {
    const response = await this.request.put(
      `${this.baseUrl}${API_ENDPOINTS.articles.bySlug(slug)}`,
      {
        headers: this.headers,
        data: articleData,
      }
    );

    if (response.status() !== HTTP_STATUS.OK) {
      throw new Error(`Failed to update article: ${response.status()}`);
    }

    const body = (await response.json()) as { article: ArticleData & { slug: string } };
    return {
      slug: body.article.slug,
      article: body.article,
    };
  }

  /**
   * Delete an article
   */
  async deleteArticle(slug: string): Promise<boolean> {
    const response = await this.request.delete(
      `${this.baseUrl}${API_ENDPOINTS.articles.bySlug(slug)}`,
      { headers: this.headers }
    );

    return response.status() === HTTP_STATUS.NO_CONTENT;
  }

  /**
   * Delete article if it exists (silent fail)
   * Useful for cleanup
   */
  async deleteArticleIfExists(slug: string): Promise<void> {
    try {
      await this.deleteArticle(slug);
    } catch {
      // Ignore errors - article may not exist
    }
  }
}
