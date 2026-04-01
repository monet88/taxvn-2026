// Tests cho biometric authentication utility (AUTH-04)
// Xác minh promptBiometricAuth gọi đúng Expo LocalAuthentication API
//
// Lưu ý: jest.mock() được hoist lên đầu file bởi Babel TRƯỚC KHI các biến const
// được khởi tạo. Vì vậy phải định nghĩa jest.fn() BÊN TRONG factory,
// rồi tham chiếu qua module đã import — đây là pattern chuẩn của Jest.

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  authenticateAsync: jest.fn(),
}));

import * as LocalAuthentication from 'expo-local-authentication';
import { promptBiometricAuth } from '../utils/biometrics';

describe('promptBiometricAuth (AUTH-04)', () => {
  // Alias typed: jest.mocked() đảm bảo TypeScript nhận diện đây là jest.Mock
  const hasHardware = LocalAuthentication.hasHardwareAsync as jest.Mock;
  const isEnrolled = LocalAuthentication.isEnrolledAsync as jest.Mock;
  const authenticate = LocalAuthentication.authenticateAsync as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gọi LocalAuthentication.hasHardwareAsync để kiểm tra thiết bị', async () => {
    hasHardware.mockResolvedValue(false);

    await promptBiometricAuth();

    expect(hasHardware).toHaveBeenCalledTimes(1);
  });

  it('trả về false khi thiết bị không hỗ trợ biometric', async () => {
    hasHardware.mockResolvedValue(false);

    const result = await promptBiometricAuth();

    expect(result).toBe(false);
    // Không nên gọi tiếp khi không có hardware
    expect(isEnrolled).not.toHaveBeenCalled();
  });

  it('trả về false khi người dùng chưa đăng ký biometric', async () => {
    hasHardware.mockResolvedValue(true);
    isEnrolled.mockResolvedValue(false);

    const result = await promptBiometricAuth();

    expect(result).toBe(false);
    expect(authenticate).not.toHaveBeenCalled();
  });

  it('gọi authenticateAsync và trả về kết quả khi có hardware và đã đăng ký', async () => {
    hasHardware.mockResolvedValue(true);
    isEnrolled.mockResolvedValue(true);
    authenticate.mockResolvedValue({ success: true });

    const result = await promptBiometricAuth('Xác nhận thanh toán');

    expect(authenticate).toHaveBeenCalledWith(
      expect.objectContaining({ promptMessage: 'Xác nhận thanh toán' })
    );
    expect(result).toBe(true);
  });
});

