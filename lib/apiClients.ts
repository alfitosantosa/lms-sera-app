"use client";

/**
 * Lightweight API client using native fetch
 * Replaces axios for better performance and smaller bundle size
 */

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
}

/**
 * Build URL with query parameters
 */
function buildUrl(url: string, params?: Record<string, string | number | boolean>): string {
  if (!params) return url;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
}

/**
 * Make a GET request
 */
export async function apiGet<T = unknown>(url: string, options?: FetchOptions): Promise<ApiResponse<T>> {
  const fullUrl = buildUrl(url, options?.params);

  const response = await fetch(fullUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json();
  return {
    data,
    status: response.status,
    statusText: response.statusText,
  };
}

/**
 * Make a POST request
 */
export async function apiPost<T = unknown>(url: string, body?: unknown, options?: FetchOptions): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });

  const data = await response.json();
  return {
    data,
    status: response.status,
    statusText: response.statusText,
  };
}

/**
 * Make a PUT request
 */
export async function apiPut<T = unknown>(url: string, body?: unknown, options?: FetchOptions): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });

  const data = await response.json();
  return {
    data,
    status: response.status,
    statusText: response.statusText,
  };
}

/**
 * Make a DELETE request
 */
export async function apiDelete<T = unknown>(url: string, options?: FetchOptions): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json();
  return {
    data,
    status: response.status,
    statusText: response.statusText,
  };
}

/**
 * Make a PATCH request
 */
export async function apiPatch<T = unknown>(url: string, body?: unknown, options?: FetchOptions): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });

  const data = await response.json();
  return {
    data,
    status: response.status,
    statusText: response.statusText,
  };
}
