import { request } from './client';
import { userApi } from './user';

import type {
  LoginRequest,
  RegisterRequest,
} from '@/types/auth';

import type {
  AuthUser,
  UpdateProfileRequest,
} from '@/types/user';

const AUTH_PATH = '/api/auth';

export const authApi = {
  login(values: LoginRequest): Promise<AuthUser> {
    return request<AuthUser>(`${AUTH_PATH}/login`, {
      method: 'POST',
      body: values,
    });
  },

  register(values: RegisterRequest): Promise<void> {
    return request<void>(`${AUTH_PATH}/register`, {
      method: 'POST',
      body: values,
    });
  },

  getCurrentUser(signal?: AbortSignal): Promise<AuthUser> {
    return request<AuthUser>(`${AUTH_PATH}/me`, {
      signal,
    });
  },

  logout(): Promise<void> {
    return request<void>(`${AUTH_PATH}/logout`, {
      method: 'POST',
    });
  },

  updateProfile(
    values: UpdateProfileRequest,
  ): Promise<AuthUser> {
    return userApi.updateProfile(values);
  },
};
