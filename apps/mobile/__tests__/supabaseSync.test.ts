// Tests cho Supabase Auth sync với Zustand (AUTH-06)
// Xác minh signOut reset session về null — hành vi cốt lõi của AUTH-06

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock persist để isolate logic store
jest.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn,
  createJSONStorage: () => ({}),
}));

import { useAuthStore } from '../stores/useAuthStore';

describe('Supabase Auth state synchronization (AUTH-06)', () => {
  beforeEach(() => {
    useAuthStore.setState({ session: null });
  });

  it('setSession lưu session vào store — mô phỏng onAuthStateChange SIGNED_IN', () => {
    const mockSession = {
      user: { id: 'user-abc', email: 'test@example.com' },
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
    } as any;

    useAuthStore.getState().setSession(mockSession);

    expect(useAuthStore.getState().session).not.toBeNull();
    expect(useAuthStore.getState().session?.access_token).toBe('mock-token');
  });

  it('signOut đặt session về null — mô phỏng AUTH-06 logout flow', () => {
    // Thiết lập session trước
    useAuthStore.setState({
      session: { user: { id: 'user-abc' }, access_token: 'token' } as any,
    });

    // Gọi signOut — giống như khi onAuthStateChange nhận SIGNED_OUT
    useAuthStore.getState().signOut();

    expect(useAuthStore.getState().session).toBeNull();
  });
});
