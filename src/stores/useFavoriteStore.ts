import { create } from 'zustand';

import { userApi } from '@/api/user';

type LoadStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'error';

interface FavoriteState {
  favoritesByUser: Record<string, string[]>;

  statusByUser: Record<string, LoadStatus>;

  pendingByUser: Record<
    string,
    Record<string, boolean>
  >;

  loadFavorites: (userId: string) => Promise<void>;

  toggleFavorite: (
    userId: string,
    rentalId: string,
  ) => Promise<boolean | undefined>;
}

const loadingTasks = new Map<string, Promise<void>>();

export const useFavoriteStore = create<FavoriteState>(
  (set, get) => ({
    favoritesByUser: {},
    statusByUser: {},
    pendingByUser: {},

    loadFavorites: async (userId) => {
      if (get().statusByUser[userId] === 'ready') {
        return;
      }

      const existingTask = loadingTasks.get(userId);

      if (existingTask) {
        return existingTask;
      }

      set((state) => ({
        statusByUser: {
          ...state.statusByUser,
          [userId]: 'loading',
        },
      }));

      const task = userApi.getFavoriteIds()
        .then((ids) => {
          set((state) => ({
            favoritesByUser: {
              ...state.favoritesByUser,
              [userId]: [...new Set(ids)],
            },
            statusByUser: {
              ...state.statusByUser,
              [userId]: 'ready',
            },
          }));
        })
        .catch((error: unknown) => {
          set((state) => ({
            statusByUser: {
              ...state.statusByUser,
              [userId]: 'error',
            },
          }));

          throw error;
        })
        .finally(() => {
          loadingTasks.delete(userId);
        });

      loadingTasks.set(userId, task);

      return task;
    },

    toggleFavorite: async (userId, rentalId) => {
      if (
        get().pendingByUser[userId]?.[rentalId]
      ) {
        return undefined;
      }

      set((state) => ({
        pendingByUser: {
          ...state.pendingByUser,
          [userId]: {
            ...state.pendingByUser[userId],
            [rentalId]: true,
          },
        },
      }));

      try {
        // Load the server state before deciding between PUT and DELETE.
        await get().loadFavorites(userId);

        const wasFavorite =
          get().favoritesByUser[userId]
            ?.includes(rentalId) ?? false;

        if (wasFavorite) {
          await userApi.removeFavorite(rentalId);
        } else {
          await userApi.addFavorite(rentalId);
        }

        // Update local state only after the request succeeds.
        set((state) => {
          const currentIds =
            state.favoritesByUser[userId] ?? [];

          const nextIds = wasFavorite
            ? currentIds.filter(
              (id) => id !== rentalId,
            )
            : [...new Set([...currentIds, rentalId])];

          return {
            favoritesByUser: {
              ...state.favoritesByUser,
              [userId]: nextIds,
            },
          };
        });

        return !wasFavorite;
      } finally {
        set((state) => ({
          pendingByUser: {
            ...state.pendingByUser,
            [userId]: {
              ...state.pendingByUser[userId],
              [rentalId]: false,
            },
          },
        }));
      }
    },
  }),
);
