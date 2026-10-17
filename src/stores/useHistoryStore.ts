import { create } from 'zustand';
import {
  createJSONStorage,
  persist,
} from 'zustand/middleware';

export interface RentalHistoryEntry {
  rentalId: string;
  viewedAt: string;
}

type HistoryState = {
  historyByOwner: Record<string, RentalHistoryEntry[]>;
  hydrated: boolean;

  addHistory: (owner: string, rentalId: string) => void;
  removeHistory: (owner: string, rentalId: string) => void;
  clearHistory: (owner: string) => void;
};

export function getHistoryOwner(userId?: string): string {
  return userId ? `user:${userId}` : 'guest';
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      historyByOwner: {},
      hydrated: false,

      addHistory: (owner, rentalId) => {
        set((state) => {
          const previous = state.historyByOwner[owner] ?? [];

          const next = [
            {
              rentalId,
              viewedAt: new Date().toISOString(),
            },
            ...previous.filter(
              (item) => item.rentalId !== rentalId,
            ),
          ].slice(0, 30);

          return {
            historyByOwner: {
              ...state.historyByOwner,
              [owner]: next,
            },
          };
        });
      },

      removeHistory: (owner, rentalId) => {
        set((state) => ({
          historyByOwner: {
            ...state.historyByOwner,
            [owner]: (
              state.historyByOwner[owner] ?? []
            ).filter((item) => item.rentalId !== rentalId),
          },
        }));
      },

      clearHistory: (owner) => {
        set((state) => ({
          historyByOwner: {
            ...state.historyByOwner,
            [owner]: [],
          },
        }));
      },
    }),
    {
      name: 'hikari-rent-history',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,

      partialize: (state) => ({
        historyByOwner: state.historyByOwner,
      }),
    },
  ),
);

// 多个组件共用同一次恢复过程。
let hydrationPromise: Promise<void> | undefined;

export function hydrateHistory(): Promise<void> {
  if (!hydrationPromise) {
    hydrationPromise = Promise.resolve()
      .then(() => useHistoryStore.persist.rehydrate())
      .then(() => {
        useHistoryStore.setState({ hydrated: true });
      })
      .catch(() => {
        // 存储读取失败时仍允许使用当前页面的内存记录。
        useHistoryStore.setState({ hydrated: true });
      });
  }

  return hydrationPromise;
}
