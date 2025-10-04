import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationsSimple as useNotifications } from '@/hooks/useNotificationsSimple';
import { COLORS } from '@/constants/theme';

interface NotificationGroup {
  title: string;
  notifications: Array<{
    id: string;
    title: string;
    body: string;
    type: string;
    read: boolean;
    timestamp: number;
  }>;
}

export default function NotificationScreen() {
  const { 
    notifications = [], 
    unreadCount = 0, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications,
    scheduleTestNotification,
    addMultipleSampleNotifications 
  } = useNotifications() || {};

  const [showDropdown, setShowDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // More accurate timestamp formatting
  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    // Invalid timestamp
    if (timestamp <= 0 || timestamp > now) {
      return 'Invalid date';
    }
    
    // Less than 5 seconds
    if (diff < 5000) {
      return 'Just now';
    }
    
    // Less than 1 minute (show seconds)
    if (diff < 60000) {
      const seconds = Math.floor(diff / 1000);
      return `${seconds}s ago`;
    }
    
    // Less than 1 hour (show minutes)
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }
    
    // Less than 24 hours (show hours)
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    
    // Less than 7 days (show days)
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }
    
    // Less than 4 weeks (show weeks)
    if (diff < 2419200000) {
      const weeks = Math.floor(diff / 604800000);
      return `${weeks}w ago`;
    }
    
    // More than 4 weeks - show date
    const date = new Date(timestamp);
    const isThisYear = date.getFullYear() === new Date().getFullYear();
    
    if (isThisYear) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Get full timestamp for accessibility
  const getFullTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // More comprehensive type icons and colors
  const getTypeIcon = (type: string): { icon: string; color: string } => {
    switch (type) {
      case 'like':
        return { icon: '❤️', color: '#ef4444' };
      case 'comment':
        return { icon: '💬', color: '#3b82f6' };
      case 'follow':
        return { icon: '👤', color: '#8b5cf6' };
      case 'mention':
        return { icon: '@', color: '#f59e0b' };
      case 'message':
        return { icon: '✉️', color: '#10b981' };
      case 'system':
        return { icon: '⚙️', color: '#6b7280' };
      default:
        return { icon: '🔔', color: COLORS.primary };
    }
  };

  // Group notifications by time - optimized with error handling
  const groupedNotifications = useMemo(() => {
    try {
      const filtered = filter === 'unread' 
        ? notifications.filter(n => !n.read)
        : notifications;

      // Limit notifications to prevent performance issues
      const limitedNotifications = filtered.slice(0, 100);

      const groups: NotificationGroup[] = [];
      const now = Date.now();
      
      const today: any[] = [];
      const yesterday: any[] = [];
      const thisWeek: any[] = [];
      const thisMonth: any[] = [];
      const older: any[] = [];

      limitedNotifications.forEach(notification => {
        try {
          const diff = now - notification.timestamp;
          
          if (diff < 86400000) { // Less than 24 hours
            today.push(notification);
          } else if (diff < 172800000) { // Less than 48 hours
            yesterday.push(notification);
          } else if (diff < 604800000) { // Less than 7 days
            thisWeek.push(notification);
          } else if (diff < 2592000000) { // Less than 30 days
            thisMonth.push(notification);
          } else {
            older.push(notification);
          }
        } catch (error) {
          console.error('Error processing notification:', error);
        }
      });

      if (today.length > 0) groups.push({ title: 'Today', notifications: today });
      if (yesterday.length > 0) groups.push({ title: 'Yesterday', notifications: yesterday });
      if (thisWeek.length > 0) groups.push({ title: 'This Week', notifications: thisWeek });
      if (thisMonth.length > 0) groups.push({ title: 'This Month', notifications: thisMonth });
      if (older.length > 0) groups.push({ title: 'Older', notifications: older });

      return groups;
    } catch (error) {
      console.error('Error grouping notifications:', error);
      return [];
    }
  }, [notifications, filter]);

  const handleMarkAllAsRead = useCallback(() => {
    try {
      if (markAllAsRead && typeof markAllAsRead === 'function') {
        markAllAsRead();
      }
      setShowDropdown(false);
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  }, [markAllAsRead]);

  const handleClearAll = useCallback(() => {
    try {
      if (!clearNotifications || typeof clearNotifications !== 'function') {
        Alert.alert('Error', 'Clear function not available');
        return;
      }
      
      Alert.alert(
        'Clear All Notifications',
        'Are you sure you want to clear all notifications?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Clear', 
            style: 'destructive',
            onPress: () => {
              clearNotifications();
              setShowDropdown(false);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error clearing notifications:', error);
      Alert.alert('Error', 'Failed to clear notifications');
    }
  }, [clearNotifications]);

  const handleTestNotification = useCallback(() => {
    try {
      if (scheduleTestNotification && typeof scheduleTestNotification === 'function') {
        scheduleTestNotification();
      }
      setShowDropdown(false);
    } catch (error) {
      console.error('Error adding test notification:', error);
      Alert.alert('Error', 'Failed to add test notification');
    }
  }, [scheduleTestNotification]);

  const handleAddMultipleNotifications = useCallback(() => {
    try {
      if (addMultipleSampleNotifications && typeof addMultipleSampleNotifications === 'function') {
        addMultipleSampleNotifications();
      }
      setShowDropdown(false);
    } catch (error) {
      console.error('Error adding multiple notifications:', error);
      Alert.alert('Error', 'Failed to add notifications');
    }
  }, [addMultipleSampleNotifications]);

  const toggleDropdown = useCallback(() => {
    setShowDropdown(prev => !prev);
  }, []);

  const onRefresh = useCallback(async () => {
    try {
    setRefreshing(true);
      // Simulate refresh - in real app, fetch from server
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const totalCount = filter === 'all' ? notifications.length : unreadCount;

  // Memoize the notification item renderer to prevent unnecessary re-renders
  const renderNotificationItem = useCallback((notification: any, index: number) => {
    try {
      if (!notification || !notification.id) {
        return null;
      }
      
      const typeInfo = getTypeIcon(notification.type);
      
      return (
        <TouchableOpacity
          key={`${notification.id}-${index}`}
          style={[
            styles.notificationItem,
            !notification.read && styles.unreadNotification
          ]}
          onPress={() => {
            try {
              if (markAsRead && typeof markAsRead === 'function') {
                markAsRead(notification.id);
              }
            } catch (error) {
              console.error('Error marking notification as read:', error);
            }
          }}
          accessibilityLabel={`${notification.title || 'Notification'}. ${notification.body || ''}. ${getFullTimestamp(notification.timestamp || Date.now())}. ${notification.read ? 'Read' : 'Unread'}`}
          accessibilityRole="button"
          accessibilityHint={notification.read ? "Already read" : "Tap to mark as read"}
        >
          <View style={styles.notificationContent}>
            <View style={[
              styles.avatarContainer,
              !notification.read && styles.avatarContainerUnread
            ]}>
              <Text style={styles.avatarIcon}>
                {typeInfo.icon}
              </Text>
            </View>
            <View style={styles.textContent}>
              <View style={styles.titleRow}>
                <Text 
                  style={[
                    styles.notificationTitle,
                    !notification.read && styles.unreadText
                  ]}
                  numberOfLines={2}
                >
                  {notification.title || 'Untitled Notification'}
                </Text>
                {!notification.read && <View style={styles.unreadDotTitle} />}
              </View>
              <Text 
                style={styles.notificationBody}
                numberOfLines={3}
              >
                {notification.body || 'No description available'}
              </Text>
              <View style={styles.notificationFooter}>
                <Text style={styles.timestamp}>
                  {formatTimestamp(notification.timestamp || Date.now())}
                </Text>
                <Text style={styles.typeLabel}>
                  {notification.type || 'system'}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    } catch (error) {
      console.error('Error rendering notification item:', error);
      return null;
    }
  }, [markAsRead]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={toggleDropdown}
          accessibilityLabel="Notification menu"
          accessibilityHint="Opens menu with notification options"
        >
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'unread' && styles.filterTabActive]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu */}
      {showDropdown && (
        <View style={styles.dropdownOverlay}>
          <TouchableOpacity 
            style={styles.overlayBackground}
            activeOpacity={1}
            onPress={toggleDropdown}
          />
          <View style={styles.dropdown}>
            <TouchableOpacity 
              style={[styles.dropdownItem, unreadCount === 0 && styles.disabledItem]} 
              onPress={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color={unreadCount === 0 ? 'rgba(255, 255, 255, 0.3)' : COLORS.primary} 
              />
              <Text style={[styles.dropdownText, unreadCount === 0 && styles.disabledText]}>
                Mark All as Read
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.dropdownItem, notifications.length === 0 && styles.disabledItem]}
              onPress={handleClearAll}
              disabled={notifications.length === 0}
            >
              <Ionicons 
                name="trash" 
                size={20} 
                color={notifications.length === 0 ? 'rgba(255, 255, 255, 0.3)' : '#ef4444'} 
              />
              <Text style={[styles.dropdownText, notifications.length === 0 && styles.disabledText]}>
                Clear All
              </Text>
            </TouchableOpacity>

            <View style={styles.dropdownDivider} />

            <TouchableOpacity style={styles.dropdownItem} onPress={handleTestNotification}>
              <Ionicons name="add-circle" size={20} color={COLORS.primary} />
              <Text style={styles.dropdownText}>Add Random Notification</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dropdownItem} onPress={handleAddMultipleNotifications}>
              <Ionicons name="notifications" size={20} color={COLORS.primary} />
              <Text style={styles.dropdownText}>Add Sample Notifications</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {totalCount === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons 
              name={filter === 'unread' ? "checkmark-circle" : "notifications-outline"} 
              size={64} 
              color="rgba(255, 255, 255, 0.3)" 
            />
            <Text style={styles.emptyText}>
              {filter === 'unread' ? "You're all caught up!" : 'No notifications yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {filter === 'unread' 
                ? 'Check back later for new notifications'
                : 'Tap the menu (⋮) to create a test notification'}
            </Text>
          </View>
        ) : (
          groupedNotifications.map((group, groupIndex) => (
            <View key={`group-${groupIndex}`} style={styles.groupContainer}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              {group.notifications.map((notification, index) => 
                renderNotificationItem(notification, index)
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: COLORS.white,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdown: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  disabledItem: {
    opacity: 0.4,
  },
  dropdownText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '500',
  },
  disabledText: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 120,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.white,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 20,
  },
  groupContainer: {
    marginTop: 20,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  notificationItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  unreadNotification: {
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: 17,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  avatarContainerUnread: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  avatarIcon: {
    fontSize: 22,
  },
  textContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  unreadText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  unreadDotTitle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
    marginTop: 7,
  },
  notificationBody: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.65)',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.45)',
    fontWeight: '500',
  },
  typeLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.35)',
    textTransform: 'capitalize',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});