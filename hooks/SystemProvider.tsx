import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useSystemInitialization } from './useSystemInitialization';

export function SystemProvider({ children }: { children: React.ReactNode }) {
  const { isReady, isLoading, error } = useSystemInitialization();

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff' }}>System Error: {error}</Text>
      </View>
    );
  }

  if (isLoading || !isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#fff', marginTop: 12 }}>Initializing system...</Text>
      </View>
    );
  }

  return <>{children}</>;
}


