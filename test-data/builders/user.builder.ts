import { faker } from '@faker-js/faker';
import { UserCredentials, UserRegistrationData, UserPayload, UserProfile } from '../types';

/**
 * Builder class for creating User test data.
 * Uses the Builder pattern for flexible, readable test data creation.
 *
 * @example
 * // Create random user credentials
 * const credentials = new UserBuilder().buildCredentials();
 *
 * @example
 * // Create user with specific email
 * const user = new UserBuilder()
 *   .withEmail('test@example.com')
 *   .withPassword('securePassword123')
 *   .buildRegistration();
 *
 * @example
 * // Create API login payload
 * const loginPayload = new UserBuilder()
 *   .withEmail('user@test.com')
 *   .withPassword('password123')
 *   .buildLoginPayload();
 */
export class UserBuilder {
  private user: UserRegistrationData & { bio: string; image: string };

  constructor() {
    // Initialize with random default values
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    this.user = {
      username: faker.internet
        .username({ firstName, lastName })
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ''),
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      password: faker.internet.password({ length: 12, memorable: false }),
      bio: faker.lorem.sentence(),
      image: faker.image.avatar(),
    };
  }

  /**
   * Set a specific username
   */
  withUsername(username: string): this {
    this.user.username = username;
    return this;
  }

  /**
   * Set a specific email
   */
  withEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  /**
   * Set a specific password
   */
  withPassword(password: string): this {
    this.user.password = password;
    return this;
  }

  /**
   * Set a specific bio
   */
  withBio(bio: string): this {
    this.user.bio = bio;
    return this;
  }

  /**
   * Set a specific profile image URL
   */
  withImage(imageUrl: string): this {
    this.user.image = imageUrl;
    return this;
  }

  /**
   * Create user with unique timestamp in username/email
   */
  withTimestamp(): this {
    const timestamp = Date.now();
    this.user.username = `user${timestamp}`;
    this.user.email = `user${timestamp}@test.com`;
    return this;
  }

  /**
   * Create user with weak password (for validation testing)
   */
  withWeakPassword(): this {
    this.user.password = '123';
    return this;
  }

  /**
   * Create user with invalid email (for validation testing)
   */
  withInvalidEmail(): this {
    this.user.email = 'invalid-email';
    return this;
  }

  /**
   * Build credentials only (email + password)
   */
  buildCredentials(): UserCredentials {
    return {
      email: this.user.email,
      password: this.user.password,
    };
  }

  /**
   * Build full registration data (username + email + password)
   */
  buildRegistration(): UserRegistrationData {
    return {
      username: this.user.username,
      email: this.user.email,
      password: this.user.password,
    };
  }

  /**
   * Build user profile data
   */
  buildProfile(): UserProfile {
    return {
      username: this.user.username,
      email: this.user.email,
      bio: this.user.bio,
      image: this.user.image,
    };
  }

  /**
   * Build API login payload
   */
  buildLoginPayload(): UserPayload {
    return {
      user: this.buildCredentials(),
    };
  }

  /**
   * Build API registration payload
   */
  buildRegistrationPayload(): UserPayload {
    return {
      user: this.buildRegistration(),
    };
  }

  /**
   * Static factory method for quick credentials creation
   */
  static randomCredentials(): UserCredentials {
    return new UserBuilder().buildCredentials();
  }

  /**
   * Static factory method for quick registration data
   */
  static randomRegistration(): UserRegistrationData {
    return new UserBuilder().buildRegistration();
  }

  /**
   * Static factory method for unique timestamped user
   */
  static unique(): UserBuilder {
    return new UserBuilder().withTimestamp();
  }
}
