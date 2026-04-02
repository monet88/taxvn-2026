import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalculationHistoryItem, PendingCalculation } from '../../stores/useHistoryStore';
import { useCalculatorStore } from '../../stores/useCalculatorStore';
import { router } from 'expo-router';

export type AnyHistoryItem = 
  | (CalculationHistoryItem & { localId?: undefined; localCreatedAt?: undefined }) 
  | (PendingCalculation & { id?: undefined; created_at?: undefined });

interface HistoryItemProps {
  item: AnyHistoryItem;
  isMultiSelectMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id?: string, localId?: string) => void;
  onLongPress: () => void;
}

export function HistoryItem({ item, isMultiSelectMode, isSelected, onToggleSelect, onLongPress }: HistoryItemProps) {
  const saveDraft = useCalculatorStore((state) => state.saveDraft);

  const isPending = !!item.localId;
  const identifier = item.id || item.localId || '';

  const handlePress = () => {
    if (isMultiSelectMode) {
      onToggleSelect(item.id, item.localId);
      return;
    }

    // Restore to calculator draft! (D-02 requirement)
    // Find the right toolId (we might need a mapping or we can just use the tool_name)
    // For now we map tool_name -> toolId if needed. Assuming tool_name matches the route param slug.
    const toolId = item.tool_name;

    // Use the inputs to repopulate the draft
    if (item.input_json) {
      // Input values need to be strings for CalculatorDraft
      const stringifiedInputs: Record<string, string> = {};
      for (const [k, v] of Object.entries(item.input_json)) {
        stringifiedInputs[k] = String(v);
      }
      saveDraft(toolId, stringifiedInputs);
    }
    
    // Navigate to the calculator (assumes [slug] is the detail page)
    if (toolId && toolId !== 'calculator' && toolId !== 'main') {
      router.push(`/tools/${toolId}`);
    } else {
      router.push('/');
    }
  };

  const handleLongPress = () => {
    onLongPress();
    onToggleSelect(item.id, item.localId);
  };

  // Format date
  const dateStr = item.created_at || (item as PendingCalculation).localCreatedAt;
  const d = dateStr ? new Date(dateStr) : new Date();
  const dateText = d.toLocaleDateString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      {isMultiSelectMode && (
        <View style={styles.checkboxContainer}>
          <Ionicons
            name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={isSelected ? '#059669' : '#9ca3af'}
          />
        </View>
      )}

      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.tool_name}</Text>
          {isPending ? (
            <Ionicons name="cloud-offline-outline" size={16} color="#9ca3af" />
          ) : (
            <Text style={styles.date}>{dateText}</Text>
          )}
        </View>
        <Text style={styles.subtitle} numberOfLines={1}>
          Kết quả: {String(Object.values(item.result_json || {})[0] || 'N/A')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'center',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
  },
  subtitle: {
    fontSize: 14,
    color: '#4b5563',
  },
});
