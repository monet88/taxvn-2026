import { describe, it, expect, beforeAll } from 'vitest';
import { isSupabaseRunning } from './helpers.js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? '';

describe('health check', () => {
  let supabaseAvailable = false;

  beforeAll(async () => {
    supabaseAvailable = await isSupabaseRunning();
  });

  it('should return ok status with database connected', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    const response = await fetch(`${SUPABASE_URL}/functions/v1/health`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.database).toBe('connected');
    expect(data.timestamp).toBeTruthy();
  });

  it('should return a valid ISO timestamp', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    const response = await fetch(`${SUPABASE_URL}/functions/v1/health`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();
    const timestamp = new Date(data.timestamp);

    expect(timestamp.toString()).not.toBe('Invalid Date');
    // Timestamp should be recent (within last minute)
    const now = new Date();
    const diffMs = Math.abs(now.getTime() - timestamp.getTime());
    expect(diffMs).toBeLessThan(60_000);
  });

  it('should handle CORS preflight', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    const response = await fetch(`${SUPABASE_URL}/functions/v1/health`, {
      method: 'OPTIONS',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Origin: 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
      },
    });

    expect(response.status).toBe(200);
    const corsHeader = response.headers.get('Access-Control-Allow-Origin');
    expect(corsHeader).toBe('*');
  });
});
