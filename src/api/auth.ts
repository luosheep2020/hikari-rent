import { request } from '@/api/client';

import type {
  AuthUser,
  LoginRequest,
  LoginResponse, RegisterRequest,
} from '@/types/auth';

export const authApi = {
  login(
    data: LoginRequest,
    signal?: AbortSignal,
  ): Promise<LoginResponse> {
    return request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: data,
      signal,
      auth: 'none',
    });
  },

  getCurrentUser(
    signal?: AbortSignal,
  ): Promise<AuthUser> {
    return request<AuthUser>('/api/auth/me', {
      method: 'GET',
      signal,
      auth: 'required',
    });
  },

  logout(
    signal?: AbortSignal,
  ): Promise<void> {
    return request<void>('/api/auth/logout', {
      method: 'POST',
      signal,
      auth: 'required',
    });
  },

  register(
    data: RegisterRequest,
    signal?: AbortSignal,
  ): Promise<void> {
    return request<void>('/api/auth/register', {
      method: 'POST',
      body: data,
      signal,
      auth: 'none',
    });
  },
};


