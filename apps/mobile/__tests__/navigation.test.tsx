import React from 'react';
import { render } from '@testing-library/react-native';
// Mocking expo-router Components
jest.mock('expo-router', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  'Tabs.Screen': () => null,
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mocking useColorScheme
jest.mock('@/components/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

import TabLayout from '../app/(tabs)/_layout';

describe('Navigation', () => {
  it('renders TabLayout without crashing', () => {
    const { toJSON } = render(<TabLayout />);
    expect(toJSON()).toBeDefined();
  });
});
