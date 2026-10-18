export interface AuthUser {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  email?: string;
  phone?: string;
}

export interface UpdateProfileRequest {
  nickname: string;
  email?: string;
  phone?: string;
}
