import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { StyleSheet, View, Text } from 'react-native';
import { useNotifications } from '@/hooks/useNotifications';

// Custom component for tab icons with badges
const TabBarIcon = ({ 
  iconName, 
  focused, 
  color, 
  size, 
  badgeCount 
}: {
  iconName: string;
  focused: boolean;
  color: string;
  size: number;
  badgeCount?: number;
}) => {
  return (
    <View style={styles.tabIconContainer}>
      <Ionicons
        name={iconName as any}
        size={size}
        color={focused ? COLORS.primary : color}
        style={focused ? styles.iconActive : undefined}
      />
      {badgeCount !== undefined && badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      )}
    </View>
  );
};

export default function TabLayout() {
  // Get real notification count from the hook
  const { unreadCount } = useNotifications();
  
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarActiveTintColor: COLORS.white,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ size, color, focused }) => (
            <TabBarIcon
              iconName={focused ? 'home' : 'home-outline'}
              focused={focused}
              color={color}
              size={focused ? size + 4 : size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          tabBarIcon: ({ size, color, focused }) => (
            <TabBarIcon
              iconName={focused ? 'bookmark' : 'bookmark-outline'}
              focused={focused}
              color={color}
              size={focused ? size + 4 : size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ size, color, focused }) => (
            <TabBarIcon
              iconName={focused ? 'add-circle' : 'add-circle-outline'}
              focused={focused}
              color={color}
              size={focused ? size + 8 : size + 4}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          tabBarIcon: ({ size, color, focused }) => (
            <TabBarIcon
              iconName={focused ? 'heart' : 'heart-outline'}
              focused={focused}
              color={color}
              size={focused ? size + 4 : size}
               badgeCount={unreadCount} // Show badge here
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ size, color, focused }) => (
            <TabBarIcon
              iconName={focused ? 'person' : 'person-outline'}
              focused={focused}
              color={color}
              size={focused ? size + 4 : size}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    elevation: 8,
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    borderTopWidth: 0,
    height: 60,
    backgroundColor: 'rgba(20, 20, 20, 0.92)',
    borderRadius: 20, 
    marginHorizontal: 15,
    marginBottom: 2,
    paddingBottom: 1,
    paddingTop: 8,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 0.5,
    backdropFilter: 'blur(30px)', 
  },
  tabIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {
    transform: [{ scale: 1.1 }],
    opacity: 1,
  },
  iconInactive: {
    transform: [{ scale: 0.9 }],
    opacity: 0.7,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -12,
    backgroundColor: '#FF3B30', 
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: 'rgba(20, 20, 20, 0.92)',
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});