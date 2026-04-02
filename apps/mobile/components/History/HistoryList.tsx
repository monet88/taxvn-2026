import React, { useMemo } from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import { HistoryItem, AnyHistoryItem } from './HistoryItem';

interface HistoryListProps {
  items: AnyHistoryItem[];
  searchQuery: string;
  activeFilter: string;
  isMultiSelectMode: boolean;
  selectedIds: string[];
  onToggleSelect: (id?: string, localId?: string) => void;
  onLongPressItem: () => void;
}

export function HistoryList({
  items,
  searchQuery,
  activeFilter,
  isMultiSelectMode,
  selectedIds,
  onToggleSelect,
  onLongPressItem,
}: HistoryListProps) {
  const sections = useMemo(() => {
    let filtered = items;

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        const titleMatch = item.tool_name.toLowerCase().includes(q);
        const resultValue = Object.values(item.result_json || {})[0]?.toString() || '';
        const resultMatch = resultValue.includes(q);
        return titleMatch || resultMatch;
      });
    }

    // Category filter logic (basic mapping based on tool_name here)
    if (activeFilter !== 'Tất cả') {
      filtered = filtered.filter((item) => {
        if (activeFilter === 'Thuế TNCN' && item.tool_name.includes('Thuế')) return true;
        if (activeFilter === 'Bảo hiểm' && item.tool_name.toLowerCase().includes('bảo hiểm')) return true;
        if (activeFilter === 'Thu nhập khác') return !item.tool_name.includes('Thuế') && !item.tool_name.toLowerCase().includes('bảo hiểm');
        return false;
      });
    }

    // Grouping logic (Today, Yesterday, Last Week, Older)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups: { title: string; data: AnyHistoryItem[] }[] = [
      { title: 'Hôm nay', data: [] },
      { title: 'Hôm qua', data: [] },
      { title: 'Tuần trước', data: [] },
      { title: 'Cũ hơn', data: [] },
    ];

    filtered.forEach((item) => {
      const dateStr = item.created_at || item.localCreatedAt;
      const d = new Date(dateStr || Date.now());

      if (d >= today) {
        groups[0].data.push(item);
      } else if (d >= yesterday) {
        groups[1].data.push(item);
      } else if (d >= lastWeek) {
        groups[2].data.push(item);
      } else {
        groups[3].data.push(item);
      }
    });

    return groups.filter((g) => g.data.length > 0);
  }, [items, searchQuery, activeFilter]);

  if (sections.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Không tìm thấy lịch sử nào phù hợp.</Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => (item.id || item.localId || Math.random().toString())}
      renderItem={({ item }) => {
        const identifier = item.id || item.localId || '';
        const isSelected = selectedIds.includes(identifier);

        return (
          <HistoryItem
            item={item}
            isMultiSelectMode={isMultiSelectMode}
            isSelected={isSelected}
            onToggleSelect={onToggleSelect}
            onLongPress={onLongPressItem}
          />
        );
      }}
      renderSectionHeader={({ section: { title } }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
      )}
      contentContainerStyle={styles.listContent}
      stickySectionHeadersEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
