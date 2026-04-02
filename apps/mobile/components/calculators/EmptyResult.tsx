import { Text, View } from 'react-native';

interface EmptyResultProps {
  title: string;
  description: string;
}

export function EmptyResult({ title, description }: EmptyResultProps) {
  return (
    <View className="gap-xs rounded-2xl border border-dashed border-border bg-surface px-md py-md">
      <Text className="text-heading font-semibold text-text-primary">{title}</Text>
      <Text className="text-body text-text-primary">{description}</Text>
    </View>
  );
}
