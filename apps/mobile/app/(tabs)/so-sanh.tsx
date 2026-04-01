import { Text, View } from 'react-native';

export default function SoSanhScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-display font-semibold text-text-primary">So Sánh</Text>
      <View className="h-[1px] w-[80%] bg-border my-md" />
      <Text className="text-body text-primary">So sánh luật 2025 và 2026</Text>
    </View>
  );
}
