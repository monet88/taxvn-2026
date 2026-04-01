/**
 * Shared test helpers for Supabase integration tests.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types.js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1`;

/**
 * Create a Supabase client with the service role key (bypasses RLS).
 */
export function createServiceClient(): SupabaseClient<Database> {
  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Create a Supabase client with the anon key (respects RLS).
 */
export function createAnonClient(): SupabaseClient<Database> {
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Create a test user via Supabase Auth and return an authenticated client.
 * Uses a unique email to avoid collisions between test runs.
 */
export async function createAuthenticatedClient(
  emailPrefix = 'test'
): Promise<{ client: SupabaseClient<Database>; userId: string; cleanup: () => Promise<void> }> {
  const serviceClient = createServiceClient();
  const email = `${emailPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.local`;
  const password = 'test-password-12345!';

  // Create user via admin API (service role)
  const { data: adminUser, error: createError } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !adminUser.user) {
    throw new Error(`Failed to create test user: ${createError?.message}`);
  }

  const userId = adminUser.user.id;

  // Sign in as the user to get a session
  const anonClient = createAnonClient();
  const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !signInData.session) {
    throw new Error(`Failed to sign in test user: ${signInError?.message}`);
  }

  // Create an authenticated client with the user's session
  const client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${signInData.session.access_token}`,
      },
    },
  });

  const cleanup = async () => {
    await serviceClient.auth.admin.deleteUser(userId);
  };

  return { client, userId, cleanup };
}

/**
 * Call a Supabase Edge Function.
 */
export async function callEdgeFunction(
  functionName: string,
  body: Record<string, unknown>,
  options?: { authToken?: string; method?: string }
): Promise<{ status: number; data: Record<string, unknown> }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
  };

  if (options?.authToken) {
    headers['Authorization'] = `Bearer ${options.authToken}`;
  }

  const response = await fetch(`${EDGE_FUNCTION_URL}/${functionName}`, {
    method: options?.method ?? 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return { status: response.status, data };
}

/**
 * Check if local Supabase is running and accessible.
 */
export async function isSupabaseRunning(): Promise<boolean> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: { apikey: SUPABASE_ANON_KEY },
    });
    return response.ok;
  } catch {
    return false;
  }
}
