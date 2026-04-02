import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Basic structure for a history entry.
 * Will be refined in Phase 5.
 */


export interface CalculatorDraft {
  toolId: string;
  updatedAt: string;
  values: Record<string, string>;
}

interface CalculatorState {
  drafts: Record<string, CalculatorDraft>;
  saveDraft: (toolId: string, values: Record<string, string>) => void;
  clearDraft: (toolId: string) => void;
}

/**
 * Persisted store for local calculation history.
 * AsyncStorage is sufficient for large history JSON arrays.
 */
export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set) => ({
      drafts: {},
      saveDraft: (toolId, values) =>
        set((state) => ({
          drafts: {
            ...state.drafts,
            [toolId]: {
              toolId,
              updatedAt: new Date().toISOString(),
              values: {
                ...state.drafts[toolId]?.values,
                ...values,
              },
            },
          },
        })),
      clearDraft: (toolId) =>
        set((state) => {
          const drafts = { ...state.drafts };
          delete drafts[toolId];

          return { drafts };
        }),
    }),
    {
      name: 'calculator-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
