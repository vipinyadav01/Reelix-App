import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNotificationsSimple as useNotifications } from "@/hooks/useNotificationsSimple";
import { theme } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "@/styles/notification.styles";

interface NotificationGroup {
  title: string;
  notifications: {
    id: string;
    title: string;
    body: string;
    type: string;
    read: boolean;
    timestamp: number;
  }[];
}

export default function NotificationScreen() {
  const {
    notifications = [],
    unreadCount = 0,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useNotifications() || {};

  const [showDropdown, setShowDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const insets = useSafeAreaInsets();

  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;

    if (timestamp <= 0 || timestamp > now) return "Invalid date";
    if (diff < 5000) return "Just now";
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    if (diff < 2419200000) return `${Math.floor(diff / 604800000)}w ago`;

    const date = new Date(timestamp);
    const isThisYear = date.getFullYear() === new Date().getFullYear();
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      ...(isThisYear ? {} : { year: "numeric" }),
    });
  };

  const getFullTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeIcon = (type: string): { icon: string; color: string } => {
    switch (type) {
      case "like":
        return { icon: "❤️", color: "#ef4444" };
      case "comment":
        return { icon: "💬", color: "#3b82f6" };
      case "follow":
        return { icon: "👤", color: "#8b5cf6" };
      case "mention":
        return { icon: "@", color: "#f59e0b" };
      case "message":
        return { icon: "✉️", color: "#10b981" };
      case "system":
        return { icon: "⚙️", color: "#6b7280" };
      default:
        return { icon: "🔔", color: theme.color.reactBlue.light };
    }
  };

  const groupedNotifications = useMemo(() => {
    try {
      const filtered =
        filter === "unread"
          ? notifications.filter((n) => !n.read)
          : notifications;
      const limited = filtered.slice(0, 100);

      const groups: NotificationGroup[] = [];
      const now = Date.now();

      const today: any[] = [];
      const yesterday: any[] = [];
      const thisWeek: any[] = [];
      const thisMonth: any[] = [];
      const older: any[] = [];

      limited.forEach((n) => {
        try {
          const diff = now - n.timestamp;
          if (diff < 86400000) today.push(n);
          else if (diff < 172800000) yesterday.push(n);
          else if (diff < 604800000) thisWeek.push(n);
          else if (diff < 2592000000) thisMonth.push(n);
          else older.push(n);
        } catch (err) {
          console.error("Error processing notification:", err);
        }
      });

      if (today.length) groups.push({ title: "Today", notifications: today });
      if (yesterday.length)
        groups.push({ title: "Yesterday", notifications: yesterday });
      if (thisWeek.length)
        groups.push({ title: "This Week", notifications: thisWeek });
      if (thisMonth.length)
        groups.push({ title: "This Month", notifications: thisMonth });
      if (older.length) groups.push({ title: "Older", notifications: older });

      return groups;
    } catch (err) {
      console.error("Error grouping notifications:", err);
      return [];
    }
  }, [notifications, filter]);

  const handleMarkAllAsRead = useCallback(() => {
    try {
      if (typeof markAllAsRead === "function") markAllAsRead();
      setShowDropdown(false);
    } catch (err) {
      console.error("Error marking all as read:", err);
      Alert.alert("Error", "Failed to mark all notifications as read");
    }
  }, [markAllAsRead]);

  const handleClearAll = useCallback(() => {
    try {
      if (typeof clearNotifications !== "function") {
        Alert.alert("Error", "Clear function not available");
        return;
      }

      Alert.alert("Clear All Notifications", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearNotifications();
            setShowDropdown(false);
          },
        },
      ]);
    } catch (err) {
      console.error("Error clearing notifications:", err);
      Alert.alert("Error", "Failed to clear notifications");
    }
  }, [clearNotifications]);

  const toggleDropdown = useCallback(
    () => setShowDropdown((prev) => !prev),
    [],
  );

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  }, []);

  const totalCount = filter === "all" ? notifications.length : unreadCount;

  const renderNotificationItem = useCallback(
    (notification: any, index: number) => {
      if (!notification?.id) return null;
      const typeInfo = getTypeIcon(notification.type);

      return (
        <TouchableOpacity
          key={`${notification.id}-${index}`}
          style={[
            styles.notificationItem,
            !notification.read && styles.unreadNotification,
          ]}
          onPress={() => markAsRead?.(notification.id)}
          accessibilityLabel={`${notification.title || "Notification"}. ${
            notification.body || ""
          }. ${getFullTimestamp(notification.timestamp || Date.now())}. ${
            notification.read ? "Read" : "Unread"
          }`}
          accessibilityRole="button"
          accessibilityHint={
            notification.read ? "Already read" : "Tap to mark as read"
          }
        >
          <View style={styles.notificationContent}>
            <View
              style={[
                styles.avatarContainer,
                !notification.read && styles.avatarContainerUnread,
              ]}
            >
              <Text style={styles.avatarIcon}>{typeInfo.icon}</Text>
            </View>
            <View style={styles.textContent}>
              <View style={styles.titleRow}>
                <Text
                  style={[
                    styles.notificationTitle,
                    !notification.read && styles.unreadText,
                  ]}
                  numberOfLines={2}
                >
                  {notification.title || "Untitled Notification"}
                </Text>
                {!notification.read && <View style={styles.unreadDotTitle} />}
              </View>
              <Text style={styles.notificationBody} numberOfLines={3}>
                {notification.body || "No description available"}
              </Text>
              <View style={styles.notificationFooter}>
                <Text style={styles.timestamp}>
                  {formatTimestamp(notification.timestamp || Date.now())}
                </Text>
                <Text style={styles.typeLabel}>
                  {notification.type || "system"}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [markAsRead],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={toggleDropdown}
          accessibilityLabel="Notification menu"
          accessibilityHint="Opens menu with notification options"
        >
          <Ionicons
            name="ellipsis-vertical"
            size={24}
            color={theme.colorWhite}
          />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === "all" && styles.filterTabActive]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "all" && styles.filterTextActive,
            ]}
          >
            All ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "unread" && styles.filterTabActive,
          ]}
          onPress={() => setFilter("unread")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "unread" && styles.filterTextActive,
            ]}
          >
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown */}
      {showDropdown && (
        <View style={styles.dropdownOverlay}>
          <TouchableOpacity
            style={styles.overlayBackground}
            activeOpacity={1}
            onPress={toggleDropdown}
          />
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={[
                styles.dropdownItem,
                unreadCount === 0 && styles.disabledItem,
              ]}
              onPress={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={
                  unreadCount === 0
                    ? "rgba(255,255,255,0.3)"
                    : theme.color.reactBlue.light
                }
              />
              <Text
                style={[
                  styles.dropdownText,
                  unreadCount === 0 && styles.disabledText,
                ]}
              >
                Mark All as Read
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dropdownItem,
                notifications.length === 0 && styles.disabledItem,
              ]}
              onPress={handleClearAll}
              disabled={notifications.length === 0}
            >
              <Ionicons
                name="trash"
                size={20}
                color={
                  notifications.length === 0
                    ? "rgba(255,255,255,0.3)"
                    : "#ef4444"
                }
              />
              <Text
                style={[
                  styles.dropdownText,
                  notifications.length === 0 && styles.disabledText,
                ]}
              >
                Clear All
              </Text>
            </TouchableOpacity>

            <View style={styles.dropdownDivider} />
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollViewContent,
          { paddingBottom: 120 + insets.bottom },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.color.reactBlue.light}
            colors={[theme.color.reactBlue.light]}
          />
        }
      >
        {totalCount === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name={
                filter === "unread"
                  ? "checkmark-circle-outline"
                  : "notifications-outline"
              }
              size={64}
              color={theme.color.textSecondary.dark}
            />
            <Text style={styles.emptyText}>
              {filter === "unread"
                ? "You're all caught up!"
                : "No notifications yet"}
            </Text>
            <Text style={styles.emptySubtext}>
              {filter === "unread"
                ? "Check back later for new notifications"
                : "Check back later for new notifications"}
            </Text>
          </View>
        ) : (
          groupedNotifications.map((group, groupIndex) => (
            <View key={`group-${groupIndex}`} style={styles.groupContainer}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              {group.notifications.map((notification, i) =>
                renderNotificationItem(notification, i),
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
