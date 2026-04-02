import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Basic structure for a history entry.
 * Will be refined in Phase 5.
 */
export interface CalculationEntry {
  id: string;
  toolId: string;
  toolName: string;
  timestamp: string;
  inputs: Record<string, any>;
  results: Record<string, any>;
}

export interface CalculatorDraft {
  toolId: string;
  updatedAt: string;
  values: Record<string, string>;
}

interface CalculatorState {
  history: CalculationEntry[];
  drafts: Record<string, CalculatorDraft>;
  addHistory: (entry: CalculationEntry) => void;
  clearHistory: () => void;
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
      history: [],
      drafts: {},
      addHistory: (entry) =>
        set((state) => ({
          history: [entry, ...state.history].slice(0, 100), // Cap at 100 entries for mobile UX
        })),
      clearHistory: () => set({ history: [] }),
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
