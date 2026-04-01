import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Session } from '@supabase/supabase-js';
import { secureStorage } from '@/utils/secureStore';

interface AuthState {
  session: Session | null;
  setSession: (session: Session | null) => void;
  signOut: () => void;
}

/**
 * Persisted store for authentication session.
 * Uses SecureStore for mobile security (AUTH-05).
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      signOut: () => set({ session: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
