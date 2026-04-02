import { Text, TouchableOpacity, View } from 'react-native';

interface ActionRowProps {
  primaryLabel?: string;
  onPrimaryPress?: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
  secondaryDisabled?: boolean;
}

export function ActionRow({
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
  secondaryDisabled,
}: ActionRowProps) {
  return (
    <View className="flex-row gap-sm">
      {primaryLabel && onPrimaryPress ? (
        <TouchableOpacity
          className="min-h-[44px] flex-1 items-center justify-center rounded-xl bg-primary px-md"
          onPress={onPrimaryPress}
          activeOpacity={0.8}
        >
          <Text className="text-body font-semibold text-background">{primaryLabel}</Text>
        </TouchableOpacity>
      ) : null}

      {secondaryLabel && onSecondaryPress ? (
        <TouchableOpacity
          className="min-h-[44px] flex-1 items-center justify-center rounded-xl border border-border px-md"
          onPress={onSecondaryPress}
          disabled={secondaryDisabled}
          activeOpacity={0.8}
        >
          <Text className="text-body font-semibold text-text-primary">{secondaryLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
