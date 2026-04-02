import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import {
  getToolsByGroup,
  TOOL_GROUP_META,
  type ToolGroup,
} from '@/constants/toolRegistry';
import { useCalculatorStore } from '@/stores/useCalculatorStore';

interface ToolListScreenProps {
  group: ToolGroup;
}

export function ToolListScreen({ group }: ToolListScreenProps) {
  const [query, setQuery] = useState('');
  const groupMeta = TOOL_GROUP_META[group];
  const tools = getToolsByGroup(group);
  const drafts = useCalculatorStore((state) => state.drafts);

  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return tools;
    }

    return tools.filter((tool) => {
      const haystack = `${tool.title} ${tool.description} ${tool.requirementId}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [query, tools]);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View className="gap-sm rounded-3xl bg-surface px-lg py-lg">
        <Text className="text-display font-semibold text-text-primary">{groupMeta.title}</Text>
        <Text className="text-body text-text-primary">{groupMeta.subtitle}</Text>
        <Text className="text-label text-primary">
          {filteredTools.length}/{tools.length} công cụ
        </Text>
      </View>

      <View className="rounded-2xl border border-border bg-white px-md py-md">
        <Text className="mb-sm text-label font-medium text-text-primary">Tìm công cụ</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Tìm công cụ theo tên hoặc tác vụ"
          placeholderTextColor="#6b7280"
          className="min-h-[44px] rounded-xl border border-border px-md text-body text-text-primary"
        />
        <Text className="mt-sm text-label text-text-primary">
          Kết quả cập nhật ngay khi bạn nhập.
        </Text>
      </View>

      <View className="gap-sm">
        {filteredTools.map((tool) => (
          <Link
            key={tool.id}
            href={{ pathname: '/tools/[slug]', params: { slug: tool.id } }}
            asChild
          >
            <Pressable className="rounded-2xl border border-border bg-white px-md py-md">
              <View className="mb-sm flex-row items-start justify-between gap-sm">
                <View className="flex-1 gap-xs">
                  <Text className="text-heading font-semibold text-text-primary">{tool.title}</Text>
                  <Text className="text-body text-text-primary">{tool.description}</Text>
                </View>
                <View className="rounded-full bg-surface px-sm py-xs">
                  <Text className="text-label font-medium text-primary">{tool.requirementId}</Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between gap-sm">
                <Text className="text-label text-text-primary">Mở công cụ</Text>
                {drafts[tool.id] ? (
                  <View className="rounded-full bg-primary/10 px-sm py-xs">
                    <Text className="text-label font-medium text-primary">Bản nháp</Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          </Link>
        ))}
      </View>

      {filteredTools.length === 0 ? (
        <View className="rounded-2xl border border-border bg-surface px-md py-md">
          <Text className="text-heading font-semibold text-text-primary">Không tìm thấy công cụ phù hợp</Text>
          <Text className="mt-xs text-body text-text-primary">
            Thử từ khóa khác hoặc mở rộng phạm vi tìm kiếm.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
