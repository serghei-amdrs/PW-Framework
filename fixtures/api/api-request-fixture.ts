import { test as base } from "@playwright/test";
import { apiRequest as apiRequestOriginal } from "./plain-function";
import {
  ApiRequestFn,
  ApiRequestMethods,
  ApiRequestParams,
  ApiRequestResponse,
} from "./types-guards";

export const test = base.extend<ApiRequestMethods>({
  apiRequest: async ({ request }, use) => {
    const apiRequestFn: ApiRequestFn = async <T = unknown>({
      method,
      url,
      baseUrl,
      body = null,
      headers,
    }: ApiRequestParams): Promise<ApiRequestResponse<T>> => {
      const response = await apiRequestOriginal({
        request,
        method,
        url,
        baseUrl,
        body,
        headers,
      });

      return {
        status: response.status,
        body: response.body as T,
      };
    };

    await use(apiRequestFn);
  },
});
