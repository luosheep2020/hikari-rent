import { create } from 'zustand';

interface FavoriteState {
  favoritesByUser: Record<string, string[]>;

  toggleFavorite: (userId: string, rentalId: string) => void;
}

export const useFavoriteStore = create<FavoriteState>((set) => ({
  favoritesByUser: {},

  toggleFavorite: (userId, rentalId) =>
    set((state) => {
      const currentIds = state.favoritesByUser[userId] ?? [];

      const nextIds = currentIds.includes(rentalId)
        ? currentIds.filter((id) => id !== rentalId)
        : [...currentIds, rentalId];

      return {
        favoritesByUser: {
          ...state.favoritesByUser,
          [userId]: nextIds,
        },
      };
    }),
}));
