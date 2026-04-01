import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  createAuthenticatedClient,
  createServiceClient,
  isSupabaseRunning,
} from './helpers.js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types.js';

describe('push tokens', () => {
  let supabaseAvailable = false;
  let clientA: SupabaseClient<Database>;
  let userIdA: string;
  let cleanupA: () => Promise<void>;
  let clientB: SupabaseClient<Database>;
  let userIdB: string;
  let cleanupB: () => Promise<void>;
  let serviceClient: SupabaseClient<Database>;

  beforeAll(async () => {
    supabaseAvailable = await isSupabaseRunning();
    if (!supabaseAvailable) return;

    serviceClient = createServiceClient();

    const authA = await createAuthenticatedClient('push-a');
    clientA = authA.client;
    userIdA = authA.userId;
    cleanupA = authA.cleanup;

    const authB = await createAuthenticatedClient('push-b');
    clientB = authB.client;
    userIdB = authB.userId;
    cleanupB = authB.cleanup;
  });

  afterAll(async () => {
    if (!supabaseAvailable) return;

    await serviceClient
      .from('push_tokens')
      .delete()
      .in('user_id', [userIdA, userIdB]);

    await cleanupA();
    await cleanupB();
  });

  beforeEach(async () => {
    if (!supabaseAvailable) return;

    await serviceClient
      .from('push_tokens')
      .delete()
      .in('user_id', [userIdA, userIdB]);
  });

  it('should register an iOS push token', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    const { data, error } = await clientA
      .from('push_tokens')
      .insert({
        user_id: userIdA,
        token: 'ios-device-token-abc123',
        platform: 'ios',
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data!.token).toBe('ios-device-token-abc123');
    expect(data!.platform).toBe('ios');
    expect(data!.user_id).toBe(userIdA);
  });

  it('should register an Android push token', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    const { data, error } = await clientA
      .from('push_tokens')
      .insert({
        user_id: userIdA,
        token: 'android-fcm-token-xyz789',
        platform: 'android',
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data!.token).toBe('android-fcm-token-xyz789');
    expect(data!.platform).toBe('android');
  });

  it('should upsert duplicate token without error', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    const tokenData = {
      user_id: userIdA,
      token: 'duplicate-token-test',
      platform: 'ios' as const,
    };

    // First insert
    const { error: err1 } = await clientA
      .from('push_tokens')
      .insert(tokenData)
      .select()
      .single();
    expect(err1).toBeNull();

    // Second insert with upsert (same user_id + token is UNIQUE)
    const { error: err2 } = await clientA
      .from('push_tokens')
      .upsert(tokenData, { onConflict: 'user_id,token' })
      .select()
      .single();
    expect(err2).toBeNull();

    // Verify only one record exists
    const { data: allTokens } = await clientA
      .from('push_tokens')
      .select('*')
      .eq('token', 'duplicate-token-test');

    expect(allTokens).toHaveLength(1);
  });

  it('should delete a push token', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    // Insert a token
    const { data: inserted } = await clientA
      .from('push_tokens')
      .insert({
        user_id: userIdA,
        token: 'token-to-delete',
        platform: 'android',
      })
      .select()
      .single();

    // Delete it
    const { error: deleteError } = await clientA
      .from('push_tokens')
      .delete()
      .eq('id', inserted!.id);

    expect(deleteError).toBeNull();

    // Verify it's gone
    const { data: remaining } = await clientA
      .from('push_tokens')
      .select('*')
      .eq('id', inserted!.id);

    expect(remaining).toHaveLength(0);
  });

  it('should enforce RLS: user can only see own tokens', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    // User A registers a token
    await clientA.from('push_tokens').insert({
      user_id: userIdA,
      token: 'user-a-exclusive-token',
      platform: 'ios',
    });

    // User B registers a token
    await clientB.from('push_tokens').insert({
      user_id: userIdB,
      token: 'user-b-exclusive-token',
      platform: 'android',
    });

    // User A queries — should only see their own tokens
    const { data: userATokens } = await clientA
      .from('push_tokens')
      .select('*');

    expect(userATokens!.every((t) => t.user_id === userIdA)).toBe(true);
    expect(userATokens!.some((t) => t.user_id === userIdB)).toBe(false);

    // User B queries — should only see their own tokens
    const { data: userBTokens } = await clientB
      .from('push_tokens')
      .select('*');

    expect(userBTokens!.every((t) => t.user_id === userIdB)).toBe(true);
    expect(userBTokens!.some((t) => t.user_id === userIdA)).toBe(false);
  });

  it('should enforce RLS: user A cannot delete user B tokens', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    // User B registers a token
    const { data: bToken } = await clientB
      .from('push_tokens')
      .insert({
        user_id: userIdB,
        token: 'b-protected-token',
        platform: 'ios',
      })
      .select()
      .single();

    // User A tries to delete user B's token — should silently fail due to RLS
    await clientA
      .from('push_tokens')
      .delete()
      .eq('id', bToken!.id);

    // Verify user B's token still exists (bypass RLS via service client)
    const { data: stillExists } = await serviceClient
      .from('push_tokens')
      .select('*')
      .eq('id', bToken!.id);

    expect(stillExists).toHaveLength(1);
  });

  it('should reject invalid platform values', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    // Platform must be 'ios' or 'android' per CHECK constraint
    const { error } = await clientA
      .from('push_tokens')
      .insert({
        user_id: userIdA,
        token: 'invalid-platform-token',
        platform: 'windows' as 'ios', // invalid
      });

    expect(error).toBeTruthy();
  });

  it('should support multiple tokens per user (different devices)', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    await clientA.from('push_tokens').insert([
      { user_id: userIdA, token: 'iphone-token', platform: 'ios' },
      { user_id: userIdA, token: 'ipad-token', platform: 'ios' },
      { user_id: userIdA, token: 'android-phone-token', platform: 'android' },
    ]);

    const { data: allTokens } = await clientA
      .from('push_tokens')
      .select('*');

    expect(allTokens!.length).toBeGreaterThanOrEqual(3);
  });
});
