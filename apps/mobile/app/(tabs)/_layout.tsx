import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tính Thuế',
          tabBarIcon: ({ color }) => <TabBarIcon name="calculator" color={color} />,
        }}
      />
      <Tabs.Screen
        name="so-sanh"
        options={{
          title: 'So Sánh',
          tabBarIcon: ({ color }) => <TabBarIcon name="exchange" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tham-khao"
        options={{
          title: 'Tham Khảo',
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tai-khoan"
        options={{
          title: 'Tài Khoản',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
