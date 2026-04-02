import { Text, View } from 'react-native';

interface ResultSummaryProps {
  title: string;
  value: string;
  description?: string;
}

export function ResultSummary({ title, value, description }: ResultSummaryProps) {
  return (
    <View className="gap-xs rounded-2xl bg-surface px-md py-md">
      <Text className="text-label font-medium text-text-primary">{title}</Text>
      <Text className="text-display font-semibold text-text-primary">{value}</Text>
      {description ? <Text className="text-body text-text-primary">{description}</Text> : null}
    </View>
  );
}
