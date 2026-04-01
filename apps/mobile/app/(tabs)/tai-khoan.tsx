import { ScrollView, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../utils/supabase';
import { Link } from 'expo-router';

/**
 * Account tab with user profile, auth actions, and legal disclaimers (UX-10, SEC-03).
 */
export default function TaiKhoanScreen() {
  const session = useAuthStore((state) => state.session);

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Lỗi', error.message);
  }

  return (
    <ScrollView className="flex-1 bg-background px-md pt-lg">
      <View className="items-center mb-xl">
        <View className="h-[80px] w-[80px] rounded-full bg-surface border border-border items-center justify-center mb-sm">
          <Text className="text-display text-primary" accessibilityRole="header">
            {session ? session.user.email?.[0].toUpperCase() : 'T'}
          </Text>
        </View>
        <Text className="text-heading font-semibold text-text-primary">
          {session ? session.user.email : 'Người dùng khách'}
        </Text>
      </View>

      <View className="gap-md">
        {session ? (
          <TouchableOpacity
            className="bg-destructive/10 h-[50px] rounded-md justify-center items-center"
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <Text className="text-destructive font-semibold text-body">Đăng xuất</Text>
          </TouchableOpacity>
        ) : (
          <Link href="/auth/login" asChild>
            <TouchableOpacity 
              className="bg-primary h-[50px] rounded-md justify-center items-center"
              activeOpacity={0.7}
            >
              <Text className="text-background font-semibold text-body">Đăng nhập tài khoản</Text>
            </TouchableOpacity>
          </Link>
        )}
      </View>

      <View className="mt-2xl pt-lg border-t border-border mb-3xl">
        <Text className="text-label font-semibold text-text-primary mb-sm" accessibilityRole="header">
          Điều khoản & Pháp lý
        </Text>
        <Text className="text-[12px] text-gray-500 leading-normal mb-sm">
          Ứng dụng TaxVN cung cấp các công cụ tính toán thuế dựa trên quy định pháp luật Việt Nam hiện hành (Luật số 109/2025/QH15). Kết quả chỉ mang tính chất tham khảo và không thay thế cho các văn bản xác nhận chính thức của cơ quan Thuế.
        </Text>
        <Text className="text-[12px] text-gray-500 leading-normal mb-sm">
          Chúng tôi không thu thập thông tin thu nhập cá nhân của bạn trừ khi bạn chủ động lưu vào lịch sử tài khoản. Dữ liệu lịch sử được bảo mật và mã hóa trên hệ thống backend.
        </Text>
        <View className="h-[1px] bg-border my-sm" />
        <Text className="text-[10px] text-gray-400 text-center uppercase tracking-widest mt-sm">
          Phiên bản 1.0.0 (tax-core v1.0)
        </Text>
      </View>
    </ScrollView>
  );
}
