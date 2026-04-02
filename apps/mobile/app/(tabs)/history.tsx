import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, TouchableOpacity, Text, Alert } from 'react-native';
import { useHistoryStore } from '../../stores/useHistoryStore';
import { HistoryList } from '../../components/History/HistoryList';
import { HistoryFilters } from '../../components/History/HistoryFilters';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tất cả');

  // Multi-select state
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]); // Both ids and localIds

  const { historyItems, pendingQueue, removeItems, removeFromQueue } = useHistoryStore();

  // Combine items, putting pending queue first
  const allItems = [...pendingQueue, ...historyItems];

  const handleToggleSelect = (id?: string, localId?: string) => {
    const identifier = id || localId;
    if (!identifier) return;

    setSelectedIds((prev) => {
      const newSelected = prev.includes(identifier)
        ? prev.filter((item) => item !== identifier)
        : [...prev, identifier];
      
      // Auto-exit multi-select if no items selected
      if (newSelected.length === 0) {
        setIsMultiSelectMode(false);
      }
      return newSelected;
    });
  };

  const handleLongPressItem = () => {
    if (!isMultiSelectMode) {
      setIsMultiSelectMode(true);
      setSelectedIds([]);
    }
  };

  const cancelMultiSelect = () => {
    setIsMultiSelectMode(false);
    setSelectedIds([]);
  };

  const confirmDelete = () => {
    Alert.alert(
      'Xóa lịch sử?',
      `Bạn có chắc chắn muốn xóa ${selectedIds.length} mục đã chọn?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => {
             // In a real app we would call a TRPC mutation here for synced items
             // Local logic for now:
             const dbIds = selectedIds.filter(id => !id.startsWith('local_'));
             if (dbIds.length > 0) {
               removeItems(dbIds);
             }

             const localIds = selectedIds.filter(id => id.startsWith('local_'));
             localIds.forEach(id => removeFromQueue(id));

             cancelMultiSelect();
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <HistoryFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />
      
      <HistoryList
        items={allItems}
        searchQuery={searchQuery}
        activeFilter={activeFilter}
        isMultiSelectMode={isMultiSelectMode}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onLongPressItem={handleLongPressItem}
      />

      {isMultiSelectMode && (
        <View style={styles.actionBar}>
          <TouchableOpacity onPress={cancelMultiSelect} style={styles.actionButton}>
            <Text style={styles.actionTextCancel}>Hủy</Text>
          </TouchableOpacity>
          <Text style={styles.selectedCount}>Đã chọn {selectedIds.length}</Text>
          <TouchableOpacity 
             onPress={confirmDelete} 
             style={[styles.actionButton, styles.deleteButton, selectedIds.length === 0 && styles.disabledButton]}
             disabled={selectedIds.length === 0}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.actionTextConfirm}>Xóa</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  selectedCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#fca5a5',
  },
  actionTextCancel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  actionTextConfirm: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});
