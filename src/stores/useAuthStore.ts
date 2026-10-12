import { create } from 'zustand';

interface AuthUser {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  email?: string;
  phone?: string;
}

type ProfileUpdate = Partial<
  Pick<AuthUser, 'nickname' | 'avatar' | 'email' | 'phone'>
>;

interface AuthState {
  user: AuthUser | null;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  login: (user: AuthUser) => void;
  logout: () => void;
  updateProfile: (profile: ProfileUpdate) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loginOpen: false,

  openLogin: () => set({ loginOpen: true }),

  closeLogin: () => set({ loginOpen: false }),

  login: (user) =>
    set({
      user,
      loginOpen: false,
    }),

  logout: () =>
    set({
      user: null,
      loginOpen: false,
    }),

  updateProfile: (profile) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, ...profile }
        : null,
    })),
}));
