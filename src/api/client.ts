import type { ApiResponse } from '@/types/api';

type QueryValue =
  | string
  | number
  | boolean
  | readonly string[]
  | undefined
  | null;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  query?: Record<string, QueryValue>;
  body?: unknown;
  signal?: AbortSignal;
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
): value is ApiResponse<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    typeof value.code === 'number' &&
    'message' in value &&
    typeof value.message === 'string'
  );
}

function buildUrl(
  path: string,
  query?: RequestOptions['query'],
): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new Error('未配置 NEXT_PUBLIC_API_BASE_URL');
  }

  const url = new URL(
    `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`,
  );

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        url.searchParams.append(key, item);
      });
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = buildUrl(path, options.query);

  const controller = new AbortController();

  const handleAbort = () => {
    controller.abort(options.signal?.reason);
  };

  if (options.signal?.aborted) {
    handleAbort();
  } else {
    options.signal?.addEventListener('abort', handleAbort, {
      once: true,
    });
  }

  const timeoutId = setTimeout(() => {
    controller.abort(
      new DOMException('请求超时', 'TimeoutError'),
    );
  }, 10000);

  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  try {
    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined && !isFormData
          ? { 'Content-Type': 'application/json' }
          : {}),
      },
      body:
        options.body === undefined
          ? undefined
          : isFormData
            ? (options.body as FormData)
            : JSON.stringify(options.body),
      credentials: 'include',
      cache: 'no-store',
      signal: controller.signal,
    });

    const text = await response.text();

    // Allow delete and logout endpoints to return 204.
    if (response.status === 204) {
      return undefined as T;
    }

    let payload: unknown;

    try {
      payload = text ? JSON.parse(text) : undefined;
    } catch {
      throw new ApiError(
        response.ok
          ? '后端返回了无效的 JSON'
          : `请求失败（HTTP ${response.status}）`,
        response.status,
      );
    }

    if (!response.ok) {
      throw new ApiError(
        isApiResponse(payload)
          ? payload.message
          : `请求失败（HTTP ${response.status}）`,
        response.status,
        isApiResponse(payload) ? payload.code : undefined,
      );
    }

    if (!isApiResponse(payload)) {
      throw new ApiError(
        '后端返回格式不符合 ApiResponse',
        response.status,
      );
    }

    if (payload.code !== 0) {
      throw new ApiError(
        payload.message || '请求失败',
        response.status,
        payload.code,
      );
    }

    return payload.data as T;
  } finally {
    clearTimeout(timeoutId);
    options.signal?.removeEventListener('abort', handleAbort);
  }
}
