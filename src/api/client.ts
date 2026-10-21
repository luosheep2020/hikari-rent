import { useAuthStore } from '@/stores/useAuthStore';

type QueryValue =
  | string
  | number
  | boolean
  | readonly (string | number)[]
  | undefined
  | null;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  query?: Record<string, QueryValue>;
  body?: unknown;
  signal?: AbortSignal;
  auth?: 'none' | 'optional' | 'required';
};

type ApiEnvelope = {
  code: number;
  message: string;
  data: unknown;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function isApiResponse(
  value: unknown,
): value is ApiEnvelope {
  return (
    typeof value === 'object'
    && value !== null
    && 'code' in value
    && typeof value.code === 'number'
    && 'message' in value
    && typeof value.message === 'string'
    && 'data' in value
  );
}

function buildUrl(
  path: string,
  query?: RequestOptions['query'],
): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new Error(
      'NEXT_PUBLIC_API_BASE_URL is missing',
    );
  }

  const url = new URL(
    `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`,
  );

  for (const [key, value] of Object.entries(query ?? {})) {
    if (
      value === undefined
      || value === null
      || value === ''
    ) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        url.searchParams.append(key, String(item));
      }
    } else {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

function getAccessToken(): string | null {
  // Browser storage is unavailable in Server Components.
  if (typeof window === 'undefined') {
    return null;
  }

  const state = useAuthStore.getState();

  if (!state.accessToken) {
    return null;
  }

  const expiresAt = state.expiresAt
    ? Date.parse(state.expiresAt)
    : Number.NaN;

  if (
    !Number.isFinite(expiresAt)
    || expiresAt <= Date.now()
  ) {
    state.clearSession();
    return null;
  }

  return state.accessToken;
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const auth = options.auth ?? 'optional';

  const token = auth === 'none'
    ? null
    : getAccessToken();

  if (auth === 'required' && !token) {
    throw new ApiError(
      'ログインしてください',
      401,
    );
  }

  const url = buildUrl(path, options.query);

  const controller = new AbortController();

  const handleAbort = () => {
    controller.abort(options.signal?.reason);
  };

  if (options.signal?.aborted) {
    handleAbort();
  } else {
    options.signal?.addEventListener(
      'abort',
      handleAbort,
      { once: true },
    );
  }

  const timeoutId = setTimeout(() => {
    controller.abort(
      new DOMException(
        'Request timed out',
        'TimeoutError',
      ),
    );
  }, 10000);

  const isFormData =
    typeof FormData !== 'undefined'
    && options.body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (
    options.body !== undefined
    && !isFormData
  ) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers,

      body:
        options.body === undefined
          ? undefined
          : isFormData
            ? options.body as FormData
            : JSON.stringify(options.body),

      credentials: 'omit',
      cache: 'no-store',
      signal: controller.signal,
    });

    // A stale request must not clear a newer login.
    if (
      response.status === 401
      && token
      && useAuthStore.getState().accessToken === token
    ) {
      useAuthStore.getState().clearSession();
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();

    let payload: unknown;

    try {
      payload = text
        ? JSON.parse(text)
        : undefined;
    } catch {
      throw new ApiError(
        `Invalid API response (HTTP ${response.status})`,
        response.status,
      );
    }

    if (!response.ok) {
      throw new ApiError(
        isApiResponse(payload)
          ? payload.message
          : `HTTP ${response.status}`,
        response.status,
        isApiResponse(payload)
          ? payload.code
          : undefined,
      );
    }

    if (!isApiResponse(payload)) {
      throw new ApiError(
        'Invalid ApiResponse envelope',
        response.status,
      );
    }

    if (payload.code !== 0) {
      throw new ApiError(
        payload.message || 'Request failed',
        response.status,
        payload.code,
      );
    }

    return payload.data as T;

  } finally {
    clearTimeout(timeoutId);

    options.signal?.removeEventListener(
      'abort',
      handleAbort,
    );
  }
}
