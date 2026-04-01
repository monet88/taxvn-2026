import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  createAuthenticatedClient,
  createServiceClient,
  isSupabaseRunning,
} from './helpers.js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types.js';

const SKIP_REASON = 'Supabase not running locally — skipping integration tests';

describe('calculation history', () => {
  let supabaseAvailable = false;
  let clientA: SupabaseClient<Database>;
  let userIdA: string;
  let cleanupA: () => Promise<void>;
  let clientB: SupabaseClient<Database>;
  let userIdB: string;
  let cleanupB: () => Promise<void>;
  let serviceClient: SupabaseClient<Database>;

  const sampleHistory = {
    tool_name: 'tax-calculator',
    input_json: { grossIncome: 25_000_000, dependents: 1, region: 1 },
    result_json: { oldTax: 1_950_000, newTax: 1_500_000, savings: 450_000 },
    tax_core_version: '0.1.0',
    snapshot_version: 1,
  };

  beforeAll(async () => {
    supabaseAvailable = await isSupabaseRunning();
    if (!supabaseAvailable) return;

    serviceClient = createServiceClient();

    // Create two test users for RLS tests
    const authA = await createAuthenticatedClient('history-a');
    clientA = authA.client;
    userIdA = authA.userId;
    cleanupA = authA.cleanup;

    const authB = await createAuthenticatedClient('history-b');
    clientB = authB.client;
    userIdB = authB.userId;
    cleanupB = authB.cleanup;
  });

  afterAll(async () => {
    if (!supabaseAvailable) return;

    // Clean up test data before deleting users
    await serviceClient
      .from('calculation_history')
      .delete()
      .in('user_id', [userIdA, userIdB]);

    await cleanupA();
    await cleanupB();
  });

  beforeEach(async () => {
    if (!supabaseAvailable) return;

    // Clean history between tests
    await serviceClient
      .from('calculation_history')
      .delete()
      .in('user_id', [userIdA, userIdB]);
  });

  it('should insert calculation history and return the created record', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true); // skip

    const { data, error } = await clientA
      .from('calculation_history')
      .insert({ ...sampleHistory, user_id: userIdA })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data!.tool_name).toBe('tax-calculator');
    expect(data!.user_id).toBe(userIdA);
    expect(data!.input_json).toEqual(sampleHistory.input_json);
    expect(data!.result_json).toEqual(sampleHistory.result_json);
    expect(data!.tax_core_version).toBe('0.1.0');
    expect(data!.id).toBeTruthy();
    expect(data!.created_at).toBeTruthy();
  });

  it('should list history with tool_name filter', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    // Insert records with different tool names
    await clientA.from('calculation_history').insert([
      { ...sampleHistory, user_id: userIdA, tool_name: 'tax-calculator' },
      { ...sampleHistory, user_id: userIdA, tool_name: 'gross-net' },
      { ...sampleHistory, user_id: userIdA, tool_name: 'tax-calculator' },
    ]);

    const { data, error } = await clientA
      .from('calculation_history')
      .select('*')
      .eq('tool_name', 'tax-calculator')
      .order('created_at', { ascending: false });

    expect(error).toBeNull();
    expect(data).toHaveLength(2);
    expect(data!.every((r) => r.tool_name === 'tax-calculator')).toBe(true);
  });

  it('should list history with date range filter', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    // Insert a record
    await clientA
      .from('calculation_history')
      .insert({ ...sampleHistory, user_id: userIdA });

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Query within range that includes the record
    const { data: inRange, error: err1 } = await clientA
      .from('calculation_history')
      .select('*')
      .gte('created_at', yesterday.toISOString())
      .lte('created_at', tomorrow.toISOString());

    expect(err1).toBeNull();
    expect(inRange!.length).toBeGreaterThanOrEqual(1);

    // Query with past range that excludes the record
    const longAgo = new Date('2020-01-01');
    const alsoLongAgo = new Date('2020-01-02');
    const { data: outOfRange, error: err2 } = await clientA
      .from('calculation_history')
      .select('*')
      .gte('created_at', longAgo.toISOString())
      .lte('created_at', alsoLongAgo.toISOString());

    expect(err2).toBeNull();
    expect(outOfRange).toHaveLength(0);
  });

  it('should support cursor-based pagination', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    // Insert 5 records
    const records = Array.from({ length: 5 }, (_, i) => ({
      ...sampleHistory,
      user_id: userIdA,
      tool_name: `tool-${i}`,
    }));
    await clientA.from('calculation_history').insert(records);

    // Page 1: get first 2 records
    const { data: page1 } = await clientA
      .from('calculation_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(2);

    expect(page1).toHaveLength(2);

    // Page 2: get next 2 records after the last record of page 1
    const lastCreatedAt = page1![page1!.length - 1].created_at;
    const { data: page2 } = await clientA
      .from('calculation_history')
      .select('*')
      .lt('created_at', lastCreatedAt)
      .order('created_at', { ascending: false })
      .limit(2);

    expect(page2).toHaveLength(2);

    // Ensure no overlap between pages
    const page1Ids = page1!.map((r) => r.id);
    const page2Ids = page2!.map((r) => r.id);
    const overlap = page1Ids.filter((id) => page2Ids.includes(id));
    expect(overlap).toHaveLength(0);
  });

  it('should delete a single record', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    const { data: inserted } = await clientA
      .from('calculation_history')
      .insert({ ...sampleHistory, user_id: userIdA })
      .select()
      .single();

    const { error: deleteError } = await clientA
      .from('calculation_history')
      .delete()
      .eq('id', inserted!.id);

    expect(deleteError).toBeNull();

    // Verify it's gone
    const { data: remaining } = await clientA
      .from('calculation_history')
      .select('*')
      .eq('id', inserted!.id);

    expect(remaining).toHaveLength(0);
  });

  it('should bulk delete multiple records', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    // Insert 3 records
    const { data: inserted } = await clientA
      .from('calculation_history')
      .insert([
        { ...sampleHistory, user_id: userIdA, tool_name: 'bulk-1' },
        { ...sampleHistory, user_id: userIdA, tool_name: 'bulk-2' },
        { ...sampleHistory, user_id: userIdA, tool_name: 'bulk-3' },
      ])
      .select();

    const idsToDelete = inserted!.map((r) => r.id);

    // Bulk delete
    const { error: deleteError } = await clientA
      .from('calculation_history')
      .delete()
      .in('id', idsToDelete);

    expect(deleteError).toBeNull();

    // Verify all are gone
    const { data: remaining } = await clientA
      .from('calculation_history')
      .select('*')
      .in('id', idsToDelete);

    expect(remaining).toHaveLength(0);
  });

  it('should enforce RLS: user A cannot see user B records', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    // User A inserts a record
    await clientA
      .from('calculation_history')
      .insert({ ...sampleHistory, user_id: userIdA });

    // User B inserts a record
    await clientB
      .from('calculation_history')
      .insert({ ...sampleHistory, user_id: userIdB, tool_name: 'bonus-calculator' });

    // User A queries — should only see their own
    const { data: userARecords } = await clientA
      .from('calculation_history')
      .select('*');

    expect(userARecords!.every((r) => r.user_id === userIdA)).toBe(true);
    expect(userARecords!.some((r) => r.user_id === userIdB)).toBe(false);

    // User B queries — should only see their own
    const { data: userBRecords } = await clientB
      .from('calculation_history')
      .select('*');

    expect(userBRecords!.every((r) => r.user_id === userIdB)).toBe(true);
    expect(userBRecords!.some((r) => r.user_id === userIdA)).toBe(false);
  });

  it('should enforce RLS: user A cannot delete user B records', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    // User B inserts a record
    const { data: bRecord } = await clientB
      .from('calculation_history')
      .insert({ ...sampleHistory, user_id: userIdB })
      .select()
      .single();

    // User A tries to delete user B's record — should silently fail (RLS)
    await clientA
      .from('calculation_history')
      .delete()
      .eq('id', bRecord!.id);

    // Verify user B's record still exists (via service client to bypass RLS)
    const { data: stillExists } = await serviceClient
      .from('calculation_history')
      .select('*')
      .eq('id', bRecord!.id);

    expect(stillExists).toHaveLength(1);
  });
});
