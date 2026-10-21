export interface UpdateProfileRequest {
  nickname: string;
  email?: string;
  phone?: string;
}
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  nickname: string;
  phone: string;
  avatar: string | null;
  companyId: string | null;
  roles: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresAt: string;
  user: AuthUser;
}
export interface RegisterRequest {
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
}
