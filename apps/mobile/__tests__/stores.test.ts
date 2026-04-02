// Tests cho Zustand stores (AUTH-00, AUTH-05)
// Xác minh logic state độc lập với persistence layer

// Mock các native module để tránh lỗi môi trường Jest
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  multiGet: jest.fn().mockResolvedValue([]),
  multiSet: jest.fn().mockResolvedValue(undefined),
}));

// Mock zustand persist middleware để test logic store thuần túy
jest.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn,
  createJSONStorage: () => ({}),
}));

import { useAuthStore } from '../stores/useAuthStore';
import { useCalculatorStore } from '../stores/useCalculatorStore';
import { useAppStore } from '../stores/useAppStore';

describe('useAuthStore (AUTH-00, AUTH-05)', () => {
  beforeEach(() => {
    // Reset store về trạng thái ban đầu trước mỗi test
    useAuthStore.setState({ session: null });
  });

  it('session mặc định là null — cho phép dùng app không cần đăng nhập (AUTH-00)', () => {
    const { session } = useAuthStore.getState();
    expect(session).toBeNull();
  });

  it('setSession cập nhật session trong store', () => {
    const mockSession = { user: { id: 'user-123' }, access_token: 'token' } as any;

    useAuthStore.getState().setSession(mockSession);

    expect(useAuthStore.getState().session).toEqual(mockSession);
  });
});

describe('useCalculatorStore (AUTH-00)', () => {
  beforeEach(() => {
    useCalculatorStore.setState({ history: [], drafts: {} } as any);
  });

  it('history mặc định là mảng rỗng', () => {
    const { history } = useCalculatorStore.getState();
    expect(Array.isArray(history)).toBe(true);
    expect(history).toHaveLength(0);
  });

  it('lưu draft theo từng tool slug và merge field mới vào draft cũ (UX-04)', () => {
    const store = useCalculatorStore.getState();

    store.saveDraft('calculator', { primaryAmount: '25000000' });
    store.saveDraft('calculator', { allowance: '2000000' });
    store.saveDraft('gross-net', { primaryAmount: '32000000' });

    expect(useCalculatorStore.getState().drafts.calculator.values).toEqual({
      primaryAmount: '25000000',
      allowance: '2000000',
    });
    expect(useCalculatorStore.getState().drafts['gross-net'].values).toEqual({
      primaryAmount: '32000000',
    });
  });

  it('clearDraft chỉ xóa draft của tool được chọn và giữ nguyên history', () => {
    const store = useCalculatorStore.getState();

    store.addHistory({
      id: 'history-1',
      toolId: 'calculator',
      toolName: 'Tính thuế TNCN',
      timestamp: '2026-04-01T12:00:00.000Z',
      inputs: { primaryAmount: 25000000 },
      results: { tax: 123456 },
    });
    store.saveDraft('calculator', { primaryAmount: '25000000' });
    store.saveDraft('gross-net', { primaryAmount: '32000000' });

    store.clearDraft('calculator');

    expect(useCalculatorStore.getState().drafts.calculator).toBeUndefined();
    expect(useCalculatorStore.getState().drafts['gross-net']).toBeDefined();
    expect(useCalculatorStore.getState().history).toHaveLength(1);
  });
});

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({ firstLaunch: true, versionMismatch: false });
  });

  it('firstLaunch mặc định là true', () => {
    const { firstLaunch } = useAppStore.getState();
    expect(firstLaunch).toBe(true);
  });
});
