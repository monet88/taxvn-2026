import { Text, View } from 'react-native';

export default function TinhThueScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-display font-semibold text-text-primary">Tính Thuế</Text>
      <View className="h-[1px] w-[80%] bg-border my-md" />
      <Text className="text-body text-primary">Các công cụ tính thuế TNCN 2026</Text>
    </View>
  );
}
