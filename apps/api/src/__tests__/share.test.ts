import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createAuthenticatedClient,
  createServiceClient,
  callEdgeFunction,
  isSupabaseRunning,
} from './helpers.js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types.js';

describe('share snapshots', () => {
  let supabaseAvailable = false;
  let serviceClient: SupabaseClient<Database>;
  let userAccessToken: string;
  let userId: string;
  let cleanupUser: () => Promise<void>;

  const sampleSnapshot = {
    snapshotJson: {
      activeTab: 'calculator',
      grossIncome: 25_000_000,
      dependents: 1,
      region: 1,
    },
    snapshotVersion: 1,
    taxCoreVersion: '0.1.0',
  };

  beforeAll(async () => {
    supabaseAvailable = await isSupabaseRunning();
    if (!supabaseAvailable) return;

    serviceClient = createServiceClient();

    // Create an authenticated user for share tests
    const auth = await createAuthenticatedClient('share');
    userId = auth.userId;
    cleanupUser = auth.cleanup;

    // Get access token for Edge Function calls
    const anonClient = (await import('@supabase/supabase-js')).createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    const email = `share-token-${Date.now()}@test.local`;
    const password = 'test-password-12345!';
    await serviceClient.auth.admin.createUser({ email, password, email_confirm: true });
    const { data: signIn } = await anonClient.auth.signInWithPassword({ email, password });
    userAccessToken = signIn?.session?.access_token ?? '';
  });

  afterAll(async () => {
    if (!supabaseAvailable) return;

    // Clean up share snapshots created during tests
    await serviceClient
      .from('share_snapshots')
      .delete()
      .neq('token', '');

    await cleanupUser();
  });

  it('should create share snapshot and return an 8-char token', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    const { status, data } = await callEdgeFunction('share', sampleSnapshot);

    expect(status).toBe(200);
    expect(data.token).toBeTruthy();
    expect(typeof data.token).toBe('string');
    expect((data.token as string).length).toBe(8);
  });

  it('should retrieve share snapshot by token via direct query', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    // Create a share
    const { data: createData } = await callEdgeFunction('share', sampleSnapshot);
    const token = createData.token as string;

    // Retrieve via Supabase client (public read via RLS)
    const { data: snapshot, error } = await serviceClient
      .from('share_snapshots')
      .select('*')
      .eq('token', token)
      .single();

    expect(error).toBeNull();
    expect(snapshot).toBeTruthy();
    expect(snapshot!.token).toBe(token);
    expect(snapshot!.snapshot_json).toEqual(sampleSnapshot.snapshotJson);
    expect(snapshot!.snapshot_version).toBe(1);
    expect(snapshot!.tax_core_version).toBe('0.1.0');
    expect(snapshot!.expires_at).toBeTruthy();
  });

  it('should set 90-day expiration on share snapshots', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    const { data: createData } = await callEdgeFunction('share', sampleSnapshot);
    const token = createData.token as string;

    const { data: snapshot } = await serviceClient
      .from('share_snapshots')
      .select('expires_at, created_at')
      .eq('token', token)
      .single();

    const createdAt = new Date(snapshot!.created_at);
    const expiresAt = new Date(snapshot!.expires_at);
    const diffDays = (expiresAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

    // Should be approximately 90 days (allow 1 day tolerance for timing)
    expect(diffDays).toBeGreaterThanOrEqual(89);
    expect(diffDays).toBeLessThanOrEqual(91);
  });

  it('should return validation error for missing required fields', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    // Missing snapshotVersion and taxCoreVersion
    const { status, data } = await callEdgeFunction('share', {
      snapshotJson: { test: true },
    });

    expect(status).toBe(400);
    expect(data.error).toBeTruthy();
    expect((data.error as Record<string, unknown>).code).toBe('VALIDATION_ERROR');
  });

  it('should return error for non-POST methods', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    const response = await fetch(
      `${process.env.SUPABASE_URL}/functions/v1/share`,
      {
        method: 'GET',
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY!,
          'Content-Type': 'application/json',
        },
      }
    );

    // Edge Function may return 405 or error
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('should generate unique tokens for each share', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    const tokens: string[] = [];
    for (let i = 0; i < 5; i++) {
      const { data } = await callEdgeFunction('share', sampleSnapshot);
      tokens.push(data.token as string);
    }

    // All tokens should be unique
    const uniqueTokens = new Set(tokens);
    expect(uniqueTokens.size).toBe(5);

    // All tokens should be 8 characters
    expect(tokens.every((t) => t.length === 8)).toBe(true);
  });
});
