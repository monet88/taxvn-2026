import { Text, View } from 'react-native';

interface ComparisonBlockProps {
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  helperText?: string;
}

export function ComparisonBlock({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  helperText,
}: ComparisonBlockProps) {
  return (
    <View className="gap-sm rounded-2xl border border-border bg-white px-md py-md">
      <View className="flex-row gap-sm">
        <View className="flex-1 rounded-2xl bg-surface px-md py-md">
          <Text className="text-label font-medium text-text-primary">{leftLabel}</Text>
          <Text className="mt-xs text-heading font-semibold text-text-primary">{leftValue}</Text>
        </View>
        <View className="flex-1 rounded-2xl bg-surface px-md py-md">
          <Text className="text-label font-medium text-text-primary">{rightLabel}</Text>
          <Text className="mt-xs text-heading font-semibold text-text-primary">{rightValue}</Text>
        </View>
      </View>
      {helperText ? <Text className="text-label text-text-primary">{helperText}</Text> : null}
    </View>
  );
}
