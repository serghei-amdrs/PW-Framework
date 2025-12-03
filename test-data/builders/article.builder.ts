import { faker } from '@faker-js/faker';
import { ArticleData, ArticlePayload, ArticleFormData } from '../types';

/**
 * Builder class for creating Article test data.
 * Uses the Builder pattern for flexible, readable test data creation.
 *
 * @example
 * // Create article with defaults (random data)
 * const article = new ArticleBuilder().build();
 *
 * @example
 * // Create article with specific title
 * const article = new ArticleBuilder()
 *   .withTitle('My Custom Title')
 *   .withTags(['playwright', 'testing'])
 *   .build();
 *
 * @example
 * // Create API payload
 * const payload = new ArticleBuilder()
 *   .withTitle('API Test Article')
 *   .buildPayload();
 */
export class ArticleBuilder {
  private article: ArticleData;

  constructor() {
    // Initialize with random default values
    this.article = {
      title: faker.lorem.words({ min: 2, max: 5 }),
      description: faker.lorem.sentence(),
      body: faker.lorem.paragraphs({ min: 1, max: 3 }),
      tagList: [faker.lorem.word(), faker.lorem.word()],
    };
  }

  /**
   * Set a specific title
   */
  withTitle(title: string): this {
    this.article.title = title;
    return this;
  }

  /**
   * Set a specific description
   */
  withDescription(description: string): this {
    this.article.description = description;
    return this;
  }

  /**
   * Set a specific body content
   */
  withBody(body: string): this {
    this.article.body = body;
    return this;
  }

  /**
   * Set specific tags
   */
  withTags(tags: string[]): this {
    this.article.tagList = tags;
    return this;
  }

  /**
   * Add a single tag to existing tags
   */
  addTag(tag: string): this {
    this.article.tagList.push(tag);
    return this;
  }

  /**
   * Set empty tags (no tags)
   */
  withNoTags(): this {
    this.article.tagList = [];
    return this;
  }

  /**
   * Create article with a unique timestamp prefix
   */
  withTimestampPrefix(): this {
    const timestamp = Date.now();
    this.article.title = `[${timestamp}] ${this.article.title}`;
    return this;
  }

  /**
   * Create a short article (minimal content)
   */
  asShortArticle(): this {
    this.article.title = faker.lorem.words(2);
    this.article.description = faker.lorem.sentence();
    this.article.body = faker.lorem.paragraph();
    this.article.tagList = [faker.lorem.word()];
    return this;
  }

  /**
   * Create a long article (extended content)
   */
  asLongArticle(): this {
    this.article.title = faker.lorem.words(8);
    this.article.description = faker.lorem.sentences(3);
    this.article.body = faker.lorem.paragraphs(10);
    this.article.tagList = Array.from({ length: 5 }, () => faker.lorem.word());
    return this;
  }

  /**
   * Build the raw article data
   */
  build(): ArticleData {
    return { ...this.article };
  }

  /**
   * Build as API payload (wrapped in { article: ... })
   */
  buildPayload(): ArticlePayload {
    return {
      article: this.build(),
    };
  }

  /**
   * Build as form data (for UI tests)
   * Tags are joined as comma-separated string
   */
  buildFormData(): ArticleFormData {
    return {
      title: this.article.title,
      description: this.article.description,
      body: this.article.body,
      tags: this.article.tagList.length > 0 ? this.article.tagList.join(', ') : undefined,
    };
  }

  /**
   * Build updated version of article (prefixes "Updated" to title)
   */
  buildUpdated(): ArticleData {
    return {
      ...this.article,
      title: `Updated ${this.article.title}`,
      description: `Updated ${this.article.description}`,
      body: `Updated ${this.article.body}`,
    };
  }

  /**
   * Build updated API payload
   */
  buildUpdatedPayload(): ArticlePayload {
    return {
      article: this.buildUpdated(),
    };
  }

  /**
   * Static factory method for quick article creation
   */
  static random(): ArticleData {
    return new ArticleBuilder().build();
  }

  /**
   * Static factory method for quick payload creation
   */
  static randomPayload(): ArticlePayload {
    return new ArticleBuilder().buildPayload();
  }
}
