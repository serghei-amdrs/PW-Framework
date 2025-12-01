import type { APIRequestContext, APIResponse } from "@playwright/test";

export type ApiRequestParams = {
  request: APIRequestContext;
  method: "POST" | "GET" | "PUT" | "DELETE";
  url: string;
  baseUrl?: string;
  body?: Record<string, unknown> | null;
  headers?: string;
};

export async function apiRequest(
  apiRequest: ApiRequestParams
): Promise<{ status: number; body: unknown }> {
  let { request, method, url, baseUrl, body, headers } = apiRequest;
  let response: APIResponse;

  const options: {
    data?: Record<string, unknown> | null;
    headers?: Record<string, string>;
  } = {};
  if (body) options.data = body;
  if (headers) {
    options.headers = {
      Authorization: `Token ${headers}`,
      "Content-Type": "application/json",
    };
  } else {
    options.headers = {
      "Content-Type": "application/json",
    };
  }

  const fullUrl = baseUrl ? `${baseUrl}${url}` : url;

  switch (method.toUpperCase()) {
    case "POST":
      response = await request.post(fullUrl, options);
      break;
    case "GET":
      response = await request.get(fullUrl, options);
      break;
    case "PUT":
      response = await request.put(fullUrl, options);
      break;
    case "DELETE":
      response = await request.delete(fullUrl, options);
      break;
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }

  const status = response.status();

  let bodyData: unknown = null;
  const contentType = response.headers()["content-type"] || "";

  try {
    if (contentType.includes("application/json")) {
      bodyData = await response.json();
    } else if (contentType.includes("text/")) {
      bodyData = await response.text();
    }
  } catch (err) {
    console.warn(`Failed to parse response body for status ${status}: ${err}`);
  }

  return { status, body: bodyData };
}
