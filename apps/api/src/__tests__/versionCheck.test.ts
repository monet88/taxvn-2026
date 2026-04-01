import { describe, it, expect, beforeAll } from 'vitest';
import { callEdgeFunction, isSupabaseRunning } from './helpers.js';

describe('version check', () => {
  let supabaseAvailable = false;

  beforeAll(async () => {
    supabaseAvailable = await isSupabaseRunning();
  });

  it('should return isSupported=true for current version', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    const { status, data } = await callEdgeFunction('version-check', {
      clientVersion: '0.1.0',
    });

    expect(status).toBe(200);
    expect(data.isSupported).toBe(true);
    expect(data.updateRequired).toBe(false);
    expect(data.latestVersion).toBeTruthy();
    expect(data.minimumVersion).toBeTruthy();
    expect(data.disabledCalculators).toBeDefined();
    expect(data.updateUrl).toBeDefined();
  });

  it('should return isSupported=false for outdated version', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    const { status, data } = await callEdgeFunction('version-check', {
      clientVersion: '0.0.1',
    });

    expect(status).toBe(200);
    expect(data.isSupported).toBe(false);
    expect(data.updateRequired).toBe(true);
  });

  it('should return isSupported=true for newer version', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    const { status, data } = await callEdgeFunction('version-check', {
      clientVersion: '99.0.0',
    });

    expect(status).toBe(200);
    expect(data.isSupported).toBe(true);
    expect(data.updateRequired).toBe(false);
  });

  it('should return validation error for missing clientVersion', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    const { status, data } = await callEdgeFunction('version-check', {});

    expect(status).toBe(400);
    expect(data.error).toBeTruthy();
    expect((data.error as Record<string, unknown>).code).toBe('VALIDATION_ERROR');
  });

  it('should include update URLs for both platforms', async () => {
    if (!supabaseAvailable) return expect(true).toBe(true);

    const { data } = await callEdgeFunction('version-check', {
      clientVersion: '0.1.0',
    });

    const updateUrl = data.updateUrl as Record<string, string>;
    expect(updateUrl.ios).toBeTruthy();
    expect(updateUrl.android).toBeTruthy();
  });
});
