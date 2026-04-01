import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../../utils/supabase';

/**
 * Registration screen with email/password flow (AUTH-01).
 */
export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    setLoading(true);
    const { error, data } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Lỗi', error.message);
    } else if (data.user) {
      Alert.alert('Thành công', 'Vui lòng kiểm tra email để xác nhận tài khoản.');
    }
    setLoading(false);
  }

  return (
    <View className="flex-1 justify-center px-lg bg-background">
      <Text className="text-display font-semibold text-text-primary mb-xl">Đăng ký</Text>

      <View className="gap-md">
        <TextInput
          placeholder="Email"
          className="h-[50px] border border-border rounded-md px-md text-body"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Mật khẩu"
          className="h-[50px] border border-border rounded-md px-md text-body"
          secureTextEntry
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          className="bg-primary h-[50px] rounded-md justify-center items-center mt-sm"
          onPress={signUpWithEmail}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-background font-semibold text-body">
              Đăng ký tài khoản
            </Text>
          )}
        </TouchableOpacity>

        <Link href="/auth/login" asChild>
          <TouchableOpacity className="items-center py-md">
            <Text className="text-primary text-label font-medium">Đã có tài khoản? Đăng nhập ngay</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
