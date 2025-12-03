import { faker } from '@faker-js/faker';
import { CommentData, CommentPayload } from '../types';

/**
 * Builder class for creating Comment test data.
 *
 * @example
 * const comment = new CommentBuilder().build();
 *
 * @example
 * const payload = new CommentBuilder()
 *   .withBody('Great article!')
 *   .buildPayload();
 */
export class CommentBuilder {
  private comment: CommentData;

  constructor() {
    this.comment = {
      body: faker.lorem.sentences({ min: 1, max: 3 }),
    };
  }

  /**
   * Set a specific comment body
   */
  withBody(body: string): this {
    this.comment.body = body;
    return this;
  }

  /**
   * Create a short comment
   */
  asShort(): this {
    this.comment.body = faker.lorem.sentence();
    return this;
  }

  /**
   * Create a long comment
   */
  asLong(): this {
    this.comment.body = faker.lorem.paragraphs(3);
    return this;
  }

  /**
   * Build the comment data
   */
  build(): CommentData {
    return { ...this.comment };
  }

  /**
   * Build as API payload
   */
  buildPayload(): CommentPayload {
    return {
      comment: this.build(),
    };
  }

  /**
   * Static factory for random comment
   */
  static random(): CommentData {
    return new CommentBuilder().build();
  }

  /**
   * Static factory for random payload
   */
  static randomPayload(): CommentPayload {
    return new CommentBuilder().buildPayload();
  }
}
