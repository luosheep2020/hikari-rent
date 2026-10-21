export interface AuthUser {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  email?: string;
  phone?: string;
}


export interface UpdateProfileRequest {
  nickname?: string;
  avatarFileId?: string;
  removeAvatar?: boolean;
}

export interface UserProfileResponse {
  id: string;
  nickname: string;
  avatar: string | null;
  avatarFileId: string | null;
}
