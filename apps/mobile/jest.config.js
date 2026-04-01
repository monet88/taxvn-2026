module.exports = {
  preset: 'jest-expo',
  // setupFilesAfterEnv: ['@testing-library/react-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules[/\\\\](?!(\.pnpm[/\\\\])?((jest-)?react-native|@react-native(-community)?|expo|@expo|react-navigation|@react-navigation|@unimodules|unimodules|sentry-expo|nativewind|react-native-svg|@taxvn))',
  ],
};
