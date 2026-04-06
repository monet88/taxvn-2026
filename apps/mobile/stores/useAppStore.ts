import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationSettings {
  deadlines: boolean;
  lawChanges: boolean;
}

interface AppState {
  firstLaunch: boolean;
  versionMismatch: boolean;
  hasAskedPush: boolean;
  notificationSettings: NotificationSettings;
  setFirstLaunch: (val: boolean) => void;
  setVersionMismatch: (val: boolean) => void;
  setHasAskedPush: (val: boolean) => void;
  setNotificationSettings: (settings: Partial<NotificationSettings>) => void;
}

/**
 * Persisted store for application preferences and status.
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      firstLaunch: true,
      versionMismatch: false,
      hasAskedPush: false,
      notificationSettings: {
        deadlines: true,
        lawChanges: true,
      },
      setFirstLaunch: (val) => set({ firstLaunch: val }),
      setVersionMismatch: (val) => set({ versionMismatch: val }),
      setHasAskedPush: (val) => set({ hasAskedPush: val }),
      setNotificationSettings: (settings) =>
        set((state) => ({
          notificationSettings: { ...state.notificationSettings, ...settings },
        })),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
