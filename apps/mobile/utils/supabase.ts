import { createClient } from '@supabase/supabase-js';
import { secureStorage } from './secureStore';

/**
 * Initialized Supabase client for mobile application.
 * Uses secure local storage for authentication tokens (AUTH-05).
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
