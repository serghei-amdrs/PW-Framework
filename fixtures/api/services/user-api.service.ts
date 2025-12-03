import { APIRequestContext } from '@playwright/test';
import { UserPayload, UserCredentials, UserRegistrationData } from '../../../test-data/types';
import { API_ENDPOINTS, HTTP_STATUS } from '../../../test-data/constants';

interface AuthResponse {
  user: {
    email: string;
    token: string;
    username: string;
    bio: string | null;
    image: string | null;
  };
}

/**
 * API Service for user/auth-related operations.
 * Used for test setup and authentication.
 */
export class UserApiService {
  private token?: string;

  constructor(
    private request: APIRequestContext,
    private baseUrl: string
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
   * Get current token
   */
  getToken(): string | undefined {
    return this.token;
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Login user and store token
   */
  async login(credentials: UserCredentials): Promise<AuthResponse> {
    const payload: UserPayload = { user: credentials };

    const response = await this.request.post(`${this.baseUrl}${API_ENDPOINTS.users.login}`, {
      headers: { 'Content-Type': 'application/json' },
      data: payload,
    });

    if (response.status() !== HTTP_STATUS.OK) {
      throw new Error(`Login failed: ${response.status()} - ${await response.text()}`);
    }

    const body = (await response.json()) as AuthResponse;
    this.token = body.user.token;
    return body;
  }

  /**
   * Register a new user
   */
  async register(userData: UserRegistrationData): Promise<AuthResponse> {
    const payload: UserPayload = { user: userData };

    const response = await this.request.post(`${this.baseUrl}${API_ENDPOINTS.users.register}`, {
      headers: { 'Content-Type': 'application/json' },
      data: payload,
    });

    if (response.status() !== HTTP_STATUS.CREATED && response.status() !== HTTP_STATUS.OK) {
      throw new Error(`Registration failed: ${response.status()} - ${await response.text()}`);
    }

    const body = (await response.json()) as AuthResponse;
    this.token = body.user.token;
    return body;
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<AuthResponse> {
    const response = await this.request.get(`${this.baseUrl}${API_ENDPOINTS.users.current}`, {
      headers: this.headers,
    });

    if (response.status() !== HTTP_STATUS.OK) {
      throw new Error(`Failed to get current user: ${response.status()}`);
    }

    return (await response.json()) as AuthResponse;
  }

  /**
   * Update current user
   */
  async updateUser(
    updates: Partial<UserRegistrationData & { bio: string; image: string }>
  ): Promise<AuthResponse> {
    const response = await this.request.put(`${this.baseUrl}${API_ENDPOINTS.users.current}`, {
      headers: this.headers,
      data: { user: updates },
    });

    if (response.status() !== HTTP_STATUS.OK) {
      throw new Error(`Failed to update user: ${response.status()}`);
    }

    return (await response.json()) as AuthResponse;
  }
}
