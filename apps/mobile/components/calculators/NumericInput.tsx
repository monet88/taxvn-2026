import { Text, TextInput, View } from 'react-native';

import { formatCurrencyInput, sanitizeNumericInput } from '@/utils/numericInput';

interface NumericInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  accessibilityLabel?: string;
}

export function NumericInput({
  label,
  value,
  onChangeText,
  placeholder,
  helperText,
  accessibilityLabel,
}: NumericInputProps) {
  return (
    <View className="gap-sm">
      <Text className="text-label font-medium text-text-primary">{label}</Text>
      <TextInput
        accessibilityLabel={accessibilityLabel ?? label}
        value={formatCurrencyInput(value)}
        onChangeText={(nextValue) => onChangeText(sanitizeNumericInput(nextValue))}
        placeholder={placeholder}
        placeholderTextColor="#6b7280"
        keyboardType="numeric"
        className="min-h-[44px] rounded-xl border border-border px-md text-body text-text-primary"
      />
      {helperText ? <Text className="text-label text-text-primary">{helperText}</Text> : null}
    </View>
  );
}
