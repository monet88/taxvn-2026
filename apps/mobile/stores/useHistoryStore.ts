import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import trpc client if needed to invoke mutations directly in actions,
// but usually mutations are called via React hooks inside components.
// Here we'll manage the local state and provide a queue.

export interface CalculationHistoryItem {
  id: string; // the database or local UUID
  user_id?: string;
  tool_name: string;
  input_json: any;
  result_json: any;
  snapshot_version: number;
  tax_core_version?: string;
  created_at: string;
}

export type PendingCalculation = Omit<CalculationHistoryItem, 'id' | 'created_at'> & {
  localId: string;
  localCreatedAt: string;
};

interface HistoryState {
  historyItems: CalculationHistoryItem[];
  pendingQueue: PendingCalculation[];

  setHistoryItems: (items: CalculationHistoryItem[]) => void;
  queueSave: (item: Omit<CalculationHistoryItem, 'id' | 'created_at'>) => void;
  removeFromQueue: (localId: string) => void;
  addToHistory: (item: CalculationHistoryItem) => void;
  removeItems: (ids: string[]) => void;
  clearAll: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      historyItems: [],
      pendingQueue: [],

      setHistoryItems: (items) => set({ historyItems: items }),

      queueSave: (item) =>
        set((state) => {
          const newItem: PendingCalculation = {
            ...item,
            localId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            localCreatedAt: new Date().toISOString(),
          };
          return {
            pendingQueue: [newItem, ...state.pendingQueue],
          };
        }),

      removeFromQueue: (localId) =>
        set((state) => ({
          pendingQueue: state.pendingQueue.filter((i) => i.localId !== localId),
        })),

      addToHistory: (item) =>
        set((state) => ({
          historyItems: [item, ...state.historyItems],
        })),

      removeItems: (ids) =>
        set((state) => ({
          historyItems: state.historyItems.filter((i) => !ids.includes(i.id)),
        })),

      clearAll: () => set({ historyItems: [], pendingQueue: [] }),
    }),
    {
      name: 'taxvn-history-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
