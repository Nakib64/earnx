import { ApiResponse, ApiError } from '../types';
import { getCookie } from './cookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiFetchOptions extends RequestInit {
  token?: string | null;
  isAdmin?: boolean;
}

/**
 * Core generic fetch wrapper producing standardized ApiResponse<T>
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: ApiFetchOptions = {},
): Promise<ApiResponse<T>> {
  const { token, isAdmin, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  const keyName = isAdmin ? 'earnx_admin_token' : 'earnx_user_token';
  const storedToken =
    token ||
    (typeof window !== 'undefined'
      ? getCookie(keyName) || localStorage.getItem(keyName)
      : null);

  if (storedToken) {
    headers['Authorization'] = `Bearer ${storedToken}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      headers,
      ...rest,
    });

    const rawData = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = rawData.message || `Request failed with status ${response.status}`;
      const formattedMessage = Array.isArray(errorMsg) ? errorMsg.join(', ') : String(errorMsg);

      return {
        success: false,
        data: null,
        error: {
          message: formattedMessage,
          code: String(response.status),
          details: rawData,
        },
        statusCode: response.status,
      };
    }

    // Direct return of data if response itself is array or object
    return {
      success: true,
      data: rawData as T,
      error: null,
      statusCode: response.status,
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      error: {
        message: err?.message || 'Network communication error',
      },
    };
  }
}

/**
 * Helper client object for strongly typed CRUD calls
 */
export const apiClient = {
  get: <T>(endpoint: string, options?: ApiFetchOptions) =>
    apiFetch<T>(endpoint, { method: 'GET', ...options }),

  post: <T, B = any>(endpoint: string, body?: B, options?: ApiFetchOptions) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  put: <T, B = any>(endpoint: string, body?: B, options?: ApiFetchOptions) =>
    apiFetch<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: <T>(endpoint: string, options?: ApiFetchOptions) =>
    apiFetch<T>(endpoint, { method: 'DELETE', ...options }),
};
