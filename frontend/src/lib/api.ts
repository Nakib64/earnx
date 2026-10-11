import { ApiResponse, ApiError } from '../types';
import { getCookie } from './cookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiFetchOptions extends RequestInit {
  token?: string | null;
  isAdmin?: boolean;
  skipCache?: boolean;
  forceRefresh?: boolean;
  cacheTTL?: number; // Time to live in milliseconds (default: 5 minutes)
}

interface CacheEntry<T = any> {
  data: ApiResponse<T>;
  timestamp: number;
}

// In-memory cache map for instantaneous GET responses
const apiCache = new Map<string, CacheEntry>();
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function buildCacheKey(endpoint: string, isAdmin?: boolean): string {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${isAdmin ? 'admin:' : 'user:'}${normalizedEndpoint}`;
}

/**
 * Invalidate cached responses matching an endpoint prefix or regex pattern.
 * If no pattern provided, clears all cache.
 */
export function invalidateApiCache(pattern?: string | RegExp): void {
  if (!pattern) {
    apiCache.clear();
    return;
  }

  for (const key of apiCache.keys()) {
    if (typeof pattern === 'string') {
      if (key.includes(pattern)) {
        apiCache.delete(key);
      }
    } else if (pattern.test(key)) {
      apiCache.delete(key);
    }
  }
}

/**
 * Synchronously retrieve cached ApiResponse if valid and not expired.
 */
export function getCachedApiResponse<T = any>(
  endpoint: string,
  options: ApiFetchOptions = {},
): ApiResponse<T> | null {
  const cacheKey = buildCacheKey(endpoint, options.isAdmin);
  const entry = apiCache.get(cacheKey);
  if (!entry) return null;

  const ttl = options.cacheTTL ?? DEFAULT_CACHE_TTL;
  if (Date.now() - entry.timestamp > ttl) {
    apiCache.delete(cacheKey);
    return null;
  }

  return entry.data as ApiResponse<T>;
}

/**
 * Synchronously retrieve cached data payload if valid and not expired.
 */
export function getCachedData<T = any>(
  endpoint: string,
  options: ApiFetchOptions = {},
): T | null {
  const cachedResponse = getCachedApiResponse<T>(endpoint, options);
  return cachedResponse?.success && cachedResponse.data !== null ? cachedResponse.data : null;
}

/**
 * Auto-invalidate related caches when mutations occur.
 */
function autoInvalidateOnMutation(endpoint: string): void {
  const ep = endpoint.toLowerCase();
  if (ep.includes('wallet') || ep.includes('withdraw') || ep.includes('deposit') || ep.includes('transfer')) {
    invalidateApiCache('wallet');
    invalidateApiCache('deposit');
    invalidateApiCache('withdraw');
    invalidateApiCache('/auth/profile');
  }
  if (ep.includes('marketplace')) {
    invalidateApiCache('marketplace');
  }
  if (ep.includes('coin')) {
    invalidateApiCache('coin');
    invalidateApiCache('wallet');
    invalidateApiCache('/auth/profile');
  }
  if (ep.includes('investment')) {
    invalidateApiCache('investment');
    invalidateApiCache('wallet');
    invalidateApiCache('/auth/profile');
  }
  if (ep.includes('premium') || ep.includes('ads')) {
    invalidateApiCache('premium');
    invalidateApiCache('ads');
    invalidateApiCache('/auth/profile');
  }
  if (ep.includes('notice')) {
    invalidateApiCache('notice');
  }
  if (ep.includes('leaderboard')) {
    invalidateApiCache('leaderboard');
  }
  if (ep.includes('profile') || ep.includes('user')) {
    invalidateApiCache('/auth/profile');
    invalidateApiCache('users');
  }
}

/**
 * Core generic fetch wrapper producing standardized ApiResponse<T> with automatic caching.
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: ApiFetchOptions = {},
): Promise<ApiResponse<T>> {
  const {
    token,
    isAdmin,
    skipCache = false,
    forceRefresh = false,
    cacheTTL = DEFAULT_CACHE_TTL,
    headers: customHeaders,
    ...rest
  } = options;

  const method = (rest.method || 'GET').toUpperCase();
  const cacheKey = buildCacheKey(endpoint, isAdmin);

  // Check cache for GET requests
  if (method === 'GET' && !skipCache && !forceRefresh) {
    const cachedEntry = apiCache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < cacheTTL) {
      return cachedEntry.data as ApiResponse<T>;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (typeof FormData !== 'undefined' && rest.body instanceof FormData) {
    delete headers['Content-Type'];
  }

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

    const result: ApiResponse<T> = {
      success: true,
      data: rawData as T,
      error: null,
      statusCode: response.status,
    };

    // Cache successful GET responses
    if (method === 'GET' && !skipCache) {
      apiCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });
    }

    // Invalidate caches on successful mutations
    if (method !== 'GET') {
      autoInvalidateOnMutation(endpoint);
    }

    return result;
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

  patch: <T, B = any>(endpoint: string, body?: B, options?: ApiFetchOptions) =>
    apiFetch<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: <T>(endpoint: string, options?: ApiFetchOptions) =>
    apiFetch<T>(endpoint, { method: 'DELETE', ...options }),
};
