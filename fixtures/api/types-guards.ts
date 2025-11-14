import { z } from 'zod';
import type {
    UserSchema,
    ErrorResponseSchema,
    ArticleResponseSchema,
} from './schemas';

type ApiMethods = 'POST' | 'GET' | 'PUT' | 'DELETE';

export type ApiRequestParams = {
    method: ApiMethods;
    url: string;
    baseUrl?: string;
    body?: Record<string, unknown> | null;
    headers?: string;
};

export type ApiRequestResponse<T = unknown> = {
    status: number;
    body: T;
};

// define the function signature as a type
export type ApiRequestFn = <T = unknown>(
    params: ApiRequestParams
) => Promise<ApiRequestResponse<T>>;

// grouping them all together
export type ApiRequestMethods = {
    apiRequest: ApiRequestFn;
};

export type User = z.infer<typeof UserSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type ArticleResponse = z.infer<typeof ArticleResponseSchema>;