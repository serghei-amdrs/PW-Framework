/**
 * User API Client
 *
 * Provides type-safe methods for user authentication and profile operations
 * with built-in schema validation and error handling.
 */

import { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from '../client/base-api-client';
import { UserResponseSchema, ProfileResponseSchema } from '../schemas/api-schemas';
import {
  User,
  UserResponse,
  Profile,
  ProfileResponse,
  LoginPayload,
  RegisterPayload,
  UpdateUserPayload,
} from '../types';
import { API_ENDPOINTS } from '../../../test-data/constants';

/**
 * User API Client for authentication and profile management
 */
export class UserApiClient extends BaseApiClient {
  constructor(request: APIRequestContext, baseUrl: string, token?: string) {
    super(request, baseUrl, token);
  }

  // ==================== Authentication ====================

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<User> {
    const payload: LoginPayload = {
      user: { email, password },
    };

    const { data } = await this.postValidated<UserResponse>(
      API_ENDPOINTS.users.login,
      UserResponseSchema,
      'UserResponse',
      { body: payload as unknown as Record<string, unknown>, skipAuth: true }
    );

    // Auto-set token for subsequent requests
    this.setToken(data.user.token);

    return data.user;
  }

  /**
   * Login and return full response (including status for error testing)
   */
  async loginWithResponse(
    email: string,
    password: string
  ): Promise<{ status: number; body: unknown }> {
    const payload: LoginPayload = {
      user: { email, password },
    };

    const response = await this.post<UserResponse>(API_ENDPOINTS.users.login, {
      body: payload as unknown as Record<string, unknown>,
      skipAuth: true,
      failSilently: true,
    });

    return { status: response.status, body: response.body };
  }

  /**
   * Register a new user
   */
  async register(username: string, email: string, password: string): Promise<User> {
    const payload: RegisterPayload = {
      user: { username, email, password },
    };

    const { data } = await this.postValidated<UserResponse>(
      API_ENDPOINTS.users.register,
      UserResponseSchema,
      'UserResponse',
      { body: payload as unknown as Record<string, unknown>, skipAuth: true }
    );

    // Auto-set token for subsequent requests
    this.setToken(data.user.token);

    return data.user;
  }

  /**
   * Register and return full response (for error testing)
   */
  async registerWithResponse(
    username: string,
    email: string,
    password: string
  ): Promise<{ status: number; body: unknown }> {
    const payload: RegisterPayload = {
      user: { username, email, password },
    };

    const response = await this.post<UserResponse>(API_ENDPOINTS.users.register, {
      body: payload as unknown as Record<string, unknown>,
      skipAuth: true,
      failSilently: true,
    });

    return { status: response.status, body: response.body };
  }

  // ==================== Current User ====================

  /**
   * Get current user (requires auth)
   */
  async getCurrentUser(): Promise<User> {
    const { data } = await this.getValidated<UserResponse>(
      API_ENDPOINTS.users.current,
      UserResponseSchema,
      'UserResponse'
    );
    return data.user;
  }

  /**
   * Update current user
   */
  async updateUser(updates: UpdateUserPayload['user']): Promise<User> {
    const payload: UpdateUserPayload = { user: updates };

    const { data } = await this.putValidated<UserResponse>(
      API_ENDPOINTS.users.current,
      UserResponseSchema,
      'UserResponse',
      { body: payload as unknown as Record<string, unknown> }
    );

    // Update token if new one is returned
    if (data.user.token) {
      this.setToken(data.user.token);
    }

    return data.user;
  }

  // ==================== Profiles ====================

  /**
   * Get user profile by username
   */
  async getProfile(username: string): Promise<Profile> {
    const { data } = await this.getValidated<ProfileResponse>(
      API_ENDPOINTS.profiles.byUsername(username),
      ProfileResponseSchema,
      'ProfileResponse'
    );
    return data.profile;
  }

  /**
   * Follow a user
   */
  async followUser(username: string): Promise<Profile> {
    const { data } = await this.postValidated<ProfileResponse>(
      API_ENDPOINTS.profiles.follow(username),
      ProfileResponseSchema,
      'ProfileResponse'
    );
    return data.profile;
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(username: string): Promise<Profile> {
    const response = await this.delete<ProfileResponse>(API_ENDPOINTS.profiles.follow(username));
    const validated = this.validateResponse(
      response.body,
      ProfileResponseSchema,
      'ProfileResponse'
    );
    return validated.profile;
  }
}
