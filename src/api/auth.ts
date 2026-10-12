import { request } from './client';

export interface AuthUser {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  email?: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nickname: string;
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  nickname: string;
  email?: string;
  phone?: string;
}

export const authApi = {
  login(values: LoginRequest): Promise<AuthUser> {
    return request<AuthUser>('/api/auth/login', {
      method: 'POST',
      body: values,
    });
  },

  register(values: RegisterRequest): Promise<void> {
    return request<void>('/api/auth/register', {
      method: 'POST',
      body: values,
    });
  },

  getCurrentUser(signal?: AbortSignal): Promise<AuthUser> {
    return request<AuthUser>('/api/auth/me', {
      signal,
    });
  },

  logout(): Promise<void> {
    return request<void>('/api/auth/logout', {
      method: 'POST',
    });
  },

  updateProfile(
    values: UpdateProfileRequest,
  ): Promise<AuthUser> {
    return request<AuthUser>('/api/account/profile', {
      method: 'PATCH',
      body: values,
    });
  },
};
