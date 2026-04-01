import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../../utils/supabase';

/**
 * Login screen with email/password flow (AUTH-02).
 */
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) Alert.alert('Lỗi', error.message);
    setLoading(false);
  }

  return (
    <View className="flex-1 justify-center px-lg bg-background">
      <Text className="text-display font-semibold text-text-primary mb-xl">Đăng nhập</Text>

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
          onPress={signInWithEmail}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-background font-semibold text-body">
              Đăng nhập tài khoản
            </Text>
          )}
        </TouchableOpacity>

        <Link href="/auth/register" asChild>
          <TouchableOpacity className="items-center py-md">
            <Text className="text-primary text-label font-medium">Chưa có tài khoản? Đăng ký ngay</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
