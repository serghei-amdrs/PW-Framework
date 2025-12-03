/**
 * Type definitions for test data structures
 */

// ==================== Article Types ====================

export interface ArticleData {
  title: string;
  description: string;
  body: string;
  tagList: string[];
}

export interface ArticlePayload {
  article: ArticleData;
}

export interface ArticleFormData {
  title: string;
  description: string;
  body: string;
  tags?: string;
}

// ==================== User Types ====================

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserRegistrationData extends UserCredentials {
  username: string;
}

export interface UserPayload {
  user: UserCredentials | UserRegistrationData;
}

export interface UserProfile {
  username: string;
  bio: string | null;
  image: string | null;
  email: string;
}

// ==================== Comment Types ====================

export interface CommentData {
  body: string;
}

export interface CommentPayload {
  comment: CommentData;
}

// ==================== Validation Types ====================

export interface InvalidCredentials {
  invalidEmails: string[];
  invalidPasswords: string[];
  invalidUsernames: string[];
}
