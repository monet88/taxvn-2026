import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  firstLaunch: boolean;
  versionMismatch: boolean;
  setFirstLaunch: (val: boolean) => void;
  setVersionMismatch: (val: boolean) => void;
}

/**
 * Persisted store for application preferences and status.
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      firstLaunch: true,
      versionMismatch: false,
      setFirstLaunch: (val) => set({ firstLaunch: val }),
      setVersionMismatch: (val) => set({ versionMismatch: val }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
