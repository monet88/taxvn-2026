// Tests cho secureStore adapter (AUTH-00, AUTH-05)
// Xác minh rằng wrapper gọi đúng API của expo-secure-store
// và tuân thủ interface StateStorage của Zustand

// Mock expo-secure-store trước khi import module cần test
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue('stored-value'),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

import * as SecureStore from 'expo-secure-store';
import { secureStorage } from '../utils/secureStore';

describe('secureStorage adapter (AUTH-05)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getItem gọi SecureStore.getItemAsync với đúng key', async () => {
    const result = await secureStorage.getItem('test-key');

    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('test-key');
    expect(result).toBe('stored-value');
  });

  it('setItem gọi SecureStore.setItemAsync với đúng key và value', async () => {
    await secureStorage.setItem('test-key', 'test-value');

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('test-key', 'test-value');
  });

  it('tuân thủ Zustand StateStorage interface (có getItem, setItem, removeItem)', () => {
    // Kiểm tra cấu trúc interface — AUTH-00 yêu cầu adapter hoạt động với Zustand persist
    expect(typeof secureStorage.getItem).toBe('function');
    expect(typeof secureStorage.setItem).toBe('function');
    expect(typeof secureStorage.removeItem).toBe('function');
  });
});
