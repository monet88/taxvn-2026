import type { PropsWithChildren } from 'react';
import { Text, View } from 'react-native';

interface SectionCardProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
}

export function SectionCard({ title, subtitle, children }: SectionCardProps) {
  return (
    <View className="gap-md rounded-2xl border border-border bg-white px-md py-md">
      <View className="gap-xs">
        <Text className="text-heading font-semibold text-text-primary">{title}</Text>
        {subtitle ? <Text className="text-body text-text-primary">{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}
