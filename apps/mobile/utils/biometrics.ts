import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Utility for local biometric authentication (AUTH-04).
 * Checks for hardware support and enrollment before prompting.
 */
export async function promptBiometricAuth(reason?: string): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return false;

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) return false;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason || 'Xác thực để tiếp tục',
      fallbackLabel: 'Sử dụng mật khẩu thiết bị',
      disableDeviceFallback: false,
    });

    return result.success;
  } catch (error) {
    console.error('Biometric Auth Error:', error);
    return false;
  }
}
