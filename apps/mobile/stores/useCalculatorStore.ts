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

interface CalculatorState {
  history: CalculationEntry[];
  addHistory: (entry: CalculationEntry) => void;
  clearHistory: () => void;
}

/**
 * Persisted store for local calculation history.
 * AsyncStorage is sufficient for large history JSON arrays.
 */
export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set) => ({
      history: [],
      addHistory: (entry) =>
        set((state) => ({
          history: [entry, ...state.history].slice(0, 100), // Cap at 100 entries for mobile UX
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'calculator-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
