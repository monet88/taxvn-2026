import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import { parseShareToken } from '../../utils/sharing';
import { useCalculatorStore } from '../../stores/useCalculatorStore';

export default function ShareHandlerScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const saveDraft = useCalculatorStore((state) => state.saveDraft);

  useEffect(() => {
    if (!token) {
      router.replace('/(tabs)/');
      return;
    }

    try {
      const payload = parseShareToken(token);
      if (payload && payload.slug && payload.values) {
        // Clean undefined properties before saving
        const cleanValues: Record<string, string> = {};
        for (const [k, v] of Object.entries(payload.values)) {
          if (v !== undefined && v !== null) {
            cleanValues[k] = v;
          }
        }
        
        // Save the received state as a draft for that toolkit
        saveDraft(payload.slug, cleanValues);
        
        // Navigate to the tool
        router.replace(`/(tabs)/tools/${payload.slug}`);
      } else {
        router.replace('/(tabs)/');
      }
    } catch {
      router.replace('/(tabs)/');
    }
  }, [token, router, saveDraft]);

  return (
    <View className="flex-1 items-center justify-center bg-background px-md">
      <ActivityIndicator size="large" color="#0066FF" />
      <Text className="mt-md text-body font-medium text-text-secondary">
        Đang tải kết quả chia sẻ...
      </Text>
    </View>
  );
}
