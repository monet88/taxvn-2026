import type { PropsWithChildren } from 'react';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface CalculatorScreenProps extends PropsWithChildren {
  title: string;
  description: string;
  badge?: string;
  caption?: string;
  onShare?: () => void;
}

export function CalculatorScreen({
  title,
  description,
  badge,
  caption,
  onShare,
  children,
}: CalculatorScreenProps) {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View className="gap-md rounded-3xl bg-surface px-lg py-lg">
        <View className="flex-row items-start justify-between gap-md">
          <View className="flex-1 gap-sm">
            <Text className="text-display font-semibold text-text-primary">{title}</Text>
            <Text className="text-body text-text-primary">{description}</Text>
          </View>
          <View className="flex-row gap-sm items-center">
            {badge ? (
              <View className="rounded-full bg-primary/10 px-sm py-xs">
                <Text className="text-label font-medium text-primary">{badge}</Text>
              </View>
            ) : null}
            {onShare ? (
              <TouchableOpacity onPress={onShare} className="rounded-full bg-surface-variant p-sm">
                 <FontAwesome name="share" size={16} color="#0066FF" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        {caption ? <Text className="text-label text-text-primary">{caption}</Text> : null}
      </View>

      {children}
    </ScrollView>
  );
}
